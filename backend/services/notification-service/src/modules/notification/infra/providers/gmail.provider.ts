import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { INotificationProvider } from "@notification/domain/providers/notification-provider.interface";
import type { NotificationPayloadDto } from "@notification/application/dto/notification-payload.dto";

@Injectable()
export class GmailProvider implements INotificationProvider {
  private readonly logger = new Logger(GmailProvider.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>("GMAIL_USER") ?? "";
    this.from = `"CondoGest" <${user}>`;
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass: this.configService.get<string>("GMAIL_APP_PASSWORD") ?? "",
      },
    });
  }

  async send(payload: NotificationPayloadDto): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: payload.to,
        subject: payload.title,
        html: payload.body,
      });
      this.logger.log(`✅ E-mail enviado para: ${payload.to}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar e-mail para ${payload.to}:`, error);
      return false;
    }
  }
}
