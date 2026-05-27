import { Module } from "@nestjs/common";
import { NotificationConsumerService } from "@notification/application/services/notification-consumer.service";

@Module({
  providers: [NotificationConsumerService],
})
export class NotificationModule {}
