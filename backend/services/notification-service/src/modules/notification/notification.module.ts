import { Module } from "@nestjs/common";
import { NotificationConsumerService } from "@notification/application/services/notification-consumer.service";
import { NotificationService } from "@notification/application/services/notification.service";
import { GmailProvider } from "@notification/infra/providers/gmail.provider";
import { FirebaseProvider } from "@notification/infra/providers/firebase.provider";

@Module({
  providers: [
    GmailProvider,
    FirebaseProvider,
    NotificationService,
    NotificationConsumerService,
  ],
})
export class NotificationModule {}
