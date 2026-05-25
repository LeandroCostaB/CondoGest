import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { UserController } from './infra/controllers/users.controller';
import { AuthService } from './application/services/auth.service';
import { UserService } from './application/services/user.service';
import { NotificationDispatchService } from './application/services/notification-dispatch.service';

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
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATION_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
            queue: 'notification.queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [UserController],
  providers: [AuthService, UserService, NotificationDispatchService],
  exports: [AuthService],
})
export class UserModule {}
