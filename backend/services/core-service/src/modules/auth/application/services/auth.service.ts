import { CreateResidentDto } from "@auth/application/dto/create-resident.dto";
import type { LoginDto } from "@auth/application/dto/login.dto";
import type { RegisterDto } from "@auth/application/dto/register.dto";
import {
  APARTMENT_REPOSITORY,
  type ApartmentRepository,
} from "@apartments/domain/repositories/apartment-repository.interface";
import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Permission } from "@shared/domain/enums/permission.enum";
import {
  CondogestNotificationExchangeName,
  CondogestNotificationRoutingKey,
} from "@shared/contracts/events/condogest-notification-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import { UserService } from "@users/application/services/user.service";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly messagingService: SharedMessagingService,
    @Inject(APARTMENT_REPOSITORY)
    private readonly apartmentRepository: ApartmentRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.messagingService.assertExchange(CondogestNotificationExchangeName.SEND);
    } catch (error) {
      this.logger.error("Falha ao assegurar exchange de notificação", error);
    }
  }

  private async publishAccountEmail(
    email: string,
    nome: string,
    temporaryPassword?: string,
  ): Promise<void> {
    const body = temporaryPassword
      ? `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
           <h2 style="color:#1D1B3A">Olá, ${nome}!</h2>
           <p>Sua conta no <strong>CondoGest</strong> foi criada pelo síndico.</p>
           <p>Use os dados abaixo para acessar o aplicativo:</p>
           <table style="width:100%;border-collapse:collapse;margin:16px 0">
             <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">E-mail</td><td style="padding:8px">${email}</td></tr>
             <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Senha temporária</td><td style="padding:8px"><strong>${temporaryPassword}</strong></td></tr>
           </table>
           <p style="color:#e53935;font-size:13px">Por segurança, altere sua senha após o primeiro acesso.</p>
         </div>`
      : `<div style="font-family:sans-serif;max-width:520px;margin:0 auto">
           <h2 style="color:#1D1B3A">Bem-vindo ao CondoGest, ${nome}!</h2>
           <p>Sua conta foi criada com sucesso.</p>
           <p>Acesse o aplicativo com seu e-mail <strong>${email}</strong> e a senha que você definiu no cadastro.</p>
           <p style="color:#666;font-size:13px">Caso precise de ajuda, entre em contato com o síndico do seu condomínio.</p>
         </div>`;

    await this.messagingService.publish(
      CondogestNotificationExchangeName.SEND,
      CondogestNotificationRoutingKey.SEND,
      {
        to: email,
        channel: "email",
        title: temporaryPassword
          ? "Sua conta no CondoGest foi criada"
          : "Bem-vindo ao CondoGest",
        body,
      },
    );
  }

  private getPermissionsByRole(role: string): string[] {
    if (role === "SINDICO") {
      return Object.values(Permission);
    }
    return [
      Permission.USERS_READ,
      Permission.TICKETS_READ,
      Permission.TICKETS_WRITE,
      Permission.MAINTENANCES_READ,
      Permission.PROVIDERS_READ,
    ];
  }

  async register(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new ConflictException("Este e-mail já está em uso.");

    const hashedSenha = await bcrypt.hash(dto.senha, 10);
    const created = await this.userService.createInternal({
      nome: dto.nome,
      email: dto.email,
      senha: hashedSenha,
      role: dto.role ?? "MORADOR",
    });

    try {
      await this.publishAccountEmail(created.email, created.nome);
    } catch (err) {
      this.logger.warn(`Falha ao enviar e-mail de boas-vindas para ${created.email}: ${String(err)}`);
    }

    return { id: created.id, nome: created.nome, email: created.email, role: created.role };
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("E-mail ou senha incorretos.");

    const valid = await bcrypt.compare(dto.senha, user.senha);
    if (!valid) throw new UnauthorizedException("E-mail ou senha incorretos.");

    const permissions = this.getPermissionsByRole(user.role);
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions,
    });

    const apartment = await this.apartmentRepository.findByUserId(user.id!).catch(() => null);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        nome: user.nome,
        role: user.role,
        permissions,
        apartmentId: apartment?.id ?? null,
        apartmentNumber: apartment?.number ?? null,
        apartmentBlock: apartment?.block ?? null,
      },
    };
  }

  async createResident(createdByUserId: string, dto: CreateResidentDto) {
    const creator = await this.userService.findByEmail(
      (await this.userService.findById(createdByUserId))?.email ?? "",
    );
    if (!creator || creator.role !== "SINDICO") {
      throw new ForbiddenException("Somente o síndico pode criar moradores.");
    }

    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new ConflictException("Este e-mail já está em uso.");

    const temporaryPassword = randomBytes(8)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10);
    const hashedSenha = await bcrypt.hash(temporaryPassword, 10);

    const created = await this.userService.createInternal({
      nome: dto.nome,
      email: dto.email,
      senha: hashedSenha,
      role: "MORADOR",
    });

    try {
      await this.publishAccountEmail(created.email, created.nome, temporaryPassword);
    } catch (err) {
      this.logger.warn(`Falha ao enviar e-mail de boas-vindas para ${created.email}: ${String(err)}`);
    }

    return {
      user: { id: created.id, nome: created.nome, email: created.email, role: created.role },
      notificationSent: true,
    };
  }
}
