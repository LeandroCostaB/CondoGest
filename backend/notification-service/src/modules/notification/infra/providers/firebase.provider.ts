import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import { INotificationProvider } from '../../domain/providers/notification-provider.interface';
import { NotificationPayloadDto } from '../../application/dto/notification-payload.dto';

@Injectable()
export class FirebaseProvider implements INotificationProvider, OnModuleInit {
    private readonly logger = new Logger(FirebaseProvider.name);

    onModuleInit() {
        try {
            if (!admin.apps.length) {
                const credentialPath = path.resolve(
                    process.cwd(),
                    process.env.FIREBASE_CREDENTIALS_PATH || './firebase-adminsdk.json'
                );

                admin.initializeApp({
                    credential: admin.credential.cert(credentialPath),
                });
                this.logger.log('🔥 Firebase Admin inicializado com sucesso.');
            }
        } catch (error) {
            this.logger.error('❌ Falha ao inicializar o Firebase Admin. Verifique o caminho do JSON no .env.', error);
        }
    }

    async send(payload: NotificationPayloadDto): Promise<boolean> {
        // Se o canal não for push, ignora (assim como fizemos no GmailProvider)
        if (payload.channel !== 'push') {
            this.logger.warn(`Canal '${payload.channel}' ignorado. O provedor Firebase só suporta 'push'.`);
            return true;
        }

        try {
            await admin.messaging().send({
                token: payload.to, // Aqui o 'to' é o Device Token gerado pelo Flutter
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data, // Payload extra para deep linking no Flutter
            });
            this.logger.log(`✅ Push Notification (FCM) enviada para o device token.`);
            return true;
        } catch (error) {
            this.logger.error(`❌ Erro ao enviar Push FCM:`, error);
            return false; // Retorna false para o Consumer dar NACK no RabbitMQ e tentar de novo
        }
    }
}