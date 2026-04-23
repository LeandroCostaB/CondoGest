import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { SharedModule } from "@shared/shared.module";
import { AuthService } from "./application/services/auth.service";
import { UserService } from "./application/services/user.service";
import { USER_REPOSITORY } from "./domain/repositories/user-repository.interface";
import { UsersController } from "./infra/controllers/users.controller";
import { DrizzleUserRepository } from "./infra/repositories/drizzle-user.repository";

@Module({
  imports: [
    ConfigModule,
    SharedModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [
    AuthService,
    UserService,
    DrizzleUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: DrizzleUserRepository,
    },
  ],
  exports: [AuthService, UserService],
})
export class UserModule {}
