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
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly messagingService: SharedMessagingService,
    @Inject(APARTMENT_REPOSITORY)
    private readonly apartmentRepository: ApartmentRepository,
  ) {}

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
      await this.messagingService.publish(
        CondogestNotificationExchangeName.SEND,
        CondogestNotificationRoutingKey.SEND,
        {
          to: created.email,
          channel: "email",
          title: "Bem-vindo ao CondoGest",
          body: `Olá, ${created.nome}! Sua senha temporária é: ${temporaryPassword}`,
        },
      );
    } catch {
      // Notificação é best-effort; não falha a operação principal
    }

    return {
      user: { id: created.id, nome: created.nome, email: created.email, role: created.role },
      notificationSent: true,
    };
  }
}
