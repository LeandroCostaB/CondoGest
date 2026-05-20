import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './infra/controllers/users.controller';
import { AuthService } from './application/services/auth.service';
import { NotificationDispatchService } from './application/services/notification-dispatch.service';
import { UserService } from './application/services/user.service';
import { NotificationPayloadService } from './application/services/notification-payload.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    AuthService,
    UserService,
    NotificationDispatchService,
    NotificationPayloadService,
  ],
  exports: [AuthService],
})
export class UserModule {}
