import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '@user/domain/models/user.entity';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@user/domain/repositories/user-repository.interface';
import { Permission } from '@shared/domain/enums/permission.enum';
import { CoreEventName } from '@shared/contracts/events/core.events';
import { MessagingService } from '@messaging/application/services/messaging.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messagingService: MessagingService,
  ) {}

  private getPermissionsByRole(role: string): string[] {
    if (role === 'SINDICO') {
      return Object.values(Permission);
    }
    return [
      Permission.USERS_READ,
      Permission.TICKETS_READ,
      Permission.TICKETS_WRITE,
      Permission.MAINTENANCES_READ,
    ];
  }

  async register(data: { nome: string; email: string; senha: string; role?: 'SINDICO' | 'MORADOR' }) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.senha, salt);

    const user = User.restore({
      nome: data.nome,
      email: data.email,
      senha: hashedPassword,
      role: data.role ?? 'MORADOR',
    });

    const created = await this.userRepository.create(user!);

    await this.messagingService.publishCoreEvent(CoreEventName.MORADOR_CRIADO, {
      id: created.id,
      nome: created.nome,
      email: created.email,
      role: created.role,
    });

    return {
      id: created.id,
      nome: created.nome,
      email: created.email,
      role: created.role,
    };
  }

  async login(email: string, senhaPlana: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const isPasswordValid = await bcrypt.compare(senhaPlana, user.senha);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    const permissions = this.getPermissionsByRole(user.role);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      permissions,
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1d',
      }),
      user: {
        id: user.id,
        nome: user.nome,
        role: user.role,
        permissions,
      },
    };
  }
}
