import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Permission } from "@shared/domain/enums/permission.enum";
import { UserService } from "@user/application/services/user.service";
import { UserType } from "@user/domain/models/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  private getPermissionsByType(type: UserType): string[] {
    if (type === UserType.SINDICO) {
      return Object.values(Permission);
    }
    return [Permission.USERS_READ];
  }

  async login(email: string, passwordPlana: string) {
    const user = await this.userService.validateCredentials(
      email,
      passwordPlana,
    );

    if (!user) {
      throw new UnauthorizedException("E-mail ou senha incorretos.");
    }

    const permissions = this.getPermissionsByType(user.type);

    const payload = {
      sub: user.id,
      email: user.email,
      type: user.type,
      permissions: permissions,
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: "1d",
      }),
      user: {
        id: user.id,
        nome: user.name,
        type: user.type,
        permissions: permissions,
      },
    };
  }
}
