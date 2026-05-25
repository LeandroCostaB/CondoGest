import { Injectable, Logger } from '@nestjs/common';
import { NotificationPayloadDto } from '../dto/notification-payload.dto';
import { GmailProvider } from '../../infra/providers/gmail.provider';
import { FirebaseProvider } from '../../infra/providers/firebase.provider';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private readonly gmailProvider: GmailProvider,
        private readonly firebaseProvider: FirebaseProvider,
    ) { }

    async processNotification(payload: NotificationPayloadDto) {
        this.logger.log(`Processando notificação [${payload.channel.toUpperCase()}]: ${payload.title}`);

        let success = false;

        // Roteamento inteligente baseado no canal
        switch (payload.channel) {
            case 'email':
                success = await this.gmailProvider.send(payload);
                break;
            case 'push':
                success = await this.firebaseProvider.send(payload);
                break;
            default:
                this.logger.warn(`Canal desconhecido: ${payload.channel}`);
                return; // Remove da fila silenciosamente se o canal for inválido
        }

        if (!success) {
            throw new Error(`Falha ao disparar notificação via ${payload.channel}`);
        }
    }
}