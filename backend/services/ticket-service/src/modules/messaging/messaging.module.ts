import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../../shared/shared.module';
import { RabbitMQService } from './infra/rabbitmq/rabbitmq.service';
import { MessagingService } from './application/services/messaging.service';
import { CoreEventConsumerService } from './application/services/core-event-consumer.service';
import { MessagingController } from './infra/controllers/messaging.controller';

@Module({
  imports: [ConfigModule, SharedModule],
  controllers: [MessagingController],
  providers: [RabbitMQService, MessagingService, CoreEventConsumerService],
  exports: [MessagingService],
})
export class MessagingModule {}
