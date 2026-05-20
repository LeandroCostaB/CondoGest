import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

interface NotificationPayload {
  pattern: string;
  data: {
    to: string;
    channel: string;
    title: string;
    body: string;
  };
}

@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);

  constructor(private readonly configService: ConfigService) {}

  async dispatch(payload: NotificationPayload): Promise<void> {
    const baseUrl = this.configService.get<string>("NOTIFICATION_SERVICE_URL");

    if (!baseUrl) {
      throw new ServiceUnavailableException(
        "NOTIFICATION_SERVICE_URL não configurada para envio de notificações.",
      );
    }

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    }).catch((error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Falha desconhecida";

      this.logger.error(`Falha ao chamar microserviço de notificação: ${message}`);
      throw new ServiceUnavailableException(
        "Não foi possível enviar a notificação para o microserviço de e-mail.",
      );
    });

    if (!response.ok) {
      const responseBody = await response.text();

      this.logger.error(
        `Microserviço de notificação respondeu ${response.status}: ${responseBody}`,
      );
      throw new ServiceUnavailableException(
        "O microserviço de e-mail recusou a notificação.",
      );
    }
  }
}
