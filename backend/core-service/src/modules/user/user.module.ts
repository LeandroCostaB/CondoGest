import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedModule } from '../../shared/shared.module';
import { MessagingModule } from '../messaging/messaging.module';
import { UserController } from './infra/controllers/users.controller';
import { AuthService } from './application/services/auth.service';
import { UserService } from './application/services/user.service';
import { USER_REPOSITORY } from './domain/repositories/user-repository.interface';
import { DrizzleUserRepository } from './infra/repositories/drizzle-user.repository';

@Module({
  imports: [
    SharedModule,
    MessagingModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [
    AuthService,
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: DrizzleUserRepository,
    },
  ],
  exports: [AuthService, UserService],
})
export class UserModule {}
