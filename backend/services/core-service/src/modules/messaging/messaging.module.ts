import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './infra/rabbitmq/rabbitmq.service';
import { MessagingService } from './application/services/messaging.service';

@Module({
  imports: [ConfigModule],
  providers: [RabbitMQService, MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
