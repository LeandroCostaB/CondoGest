import { Module } from '@nestjs/common';
import { NotificationController } from './infra/controllers/notification.controller';
import { NotificationService } from './application/services/notification.service';
import { GmailProvider } from './infra/providers/gmail.provider';
import { FirebaseProvider } from './infra/providers/firebase.provider';

@Module({
    controllers: [NotificationController],
    providers: [
        NotificationService,
        GmailProvider,
        FirebaseProvider
    ],
})
export class NotificationModule { }