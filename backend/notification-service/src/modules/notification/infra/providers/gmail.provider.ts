import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { INotificationProvider } from '../../domain/providers/notification-provider.interface';
import { NotificationPayloadDto } from '../../application/dto/notification-payload.dto';

@Injectable()
export class GmailProvider implements INotificationProvider {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(GmailProvider.name);

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    async send(payload: NotificationPayloadDto): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: `"CondoGest" <${process.env.GMAIL_USER}>`,
                to: payload.to,
                subject: payload.title,
                text: payload.body,
            });
            this.logger.log(`✅ E-mail SMTP enviado para: ${payload.to}`);
            return true;
        } catch (error) {
            this.logger.error(`❌ Erro ao enviar E-mail:`, error);
            return false;
        }
    }
}