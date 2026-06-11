import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";
import * as path from "node:path";
import type { INotificationProvider } from "@notification/domain/providers/notification-provider.interface";
import type { NotificationPayloadDto } from "@notification/application/dto/notification-payload.dto";

@Injectable()
export class FirebaseProvider implements INotificationProvider, OnModuleInit {
  private readonly logger = new Logger(FirebaseProvider.name);
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const credentialPath = this.configService.get<string>("FIREBASE_CREDENTIALS_PATH");
    if (!credentialPath) {
      this.logger.warn("FIREBASE_CREDENTIALS_PATH não configurado — push notifications desabilitado.");
      return;
    }

    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(path.resolve(process.cwd(), credentialPath)),
        });
      }
      this.initialized = true;
      this.logger.log("🔥 Firebase Admin inicializado com sucesso.");
    } catch (error) {
      this.logger.error("❌ Falha ao inicializar Firebase Admin.", error);
    }
  }

  async send(payload: NotificationPayloadDto): Promise<boolean> {
    if (!this.initialized) {
      this.logger.warn("Firebase não inicializado — push ignorado.");
      return false;
    }

    try {
      await admin.messaging().send({
        token: payload.to,
        notification: { title: payload.title, body: payload.body },
        data: payload.data,
      });
      this.logger.log("✅ Push FCM enviado.");
      return true;
    } catch (error) {
      this.logger.error("❌ Erro ao enviar Push FCM:", error);
      return false;
    }
  }
}
