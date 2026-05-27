import { Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";
import type { Channel, ChannelModel } from "amqplib";
import amqplib from "amqplib";
import { ConfigService } from "@nestjs/config";
import {
  CondogestTicketExchangeName,
  CondogestTicketRoutingKey,
} from "@shared/contracts/events/condogest-ticket-events.enum";
import {
  CondogestNotificationExchangeName,
  CondogestNotificationRoutingKey,
} from "@shared/contracts/events/condogest-notification-events.enum";

@Injectable()
export class NotificationConsumerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(NotificationConsumerService.name);
  private static readonly QUEUE = "condogest.notification-service.events.queue";

  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(private readonly configService: ConfigService) {}

  async onApplicationBootstrap(): Promise<void> {
    const url = this.configService.get<string>("RABBITMQ_URL");
    if (!url) {
      this.logger.warn("RABBITMQ_URL not configured; notification consumer disabled.");
      return;
    }

    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();

    const exchanges = [
      { name: CondogestTicketExchangeName.TICKET_CREATED, key: CondogestTicketRoutingKey.TICKET_CREATED },
      { name: CondogestTicketExchangeName.TICKET_STATUS_CHANGED, key: CondogestTicketRoutingKey.TICKET_STATUS_CHANGED },
      { name: CondogestTicketExchangeName.MAINTENANCE_COMPLETED, key: CondogestTicketRoutingKey.MAINTENANCE_COMPLETED },
      { name: CondogestNotificationExchangeName.SEND, key: CondogestNotificationRoutingKey.SEND },
    ];

    for (const { name } of exchanges) {
      await this.channel.assertExchange(name, "direct", { durable: true });
    }

    await this.channel.assertQueue(NotificationConsumerService.QUEUE, { durable: true });

    for (const { name, key } of exchanges) {
      await this.channel.bindQueue(NotificationConsumerService.QUEUE, name, key);
    }

    await this.channel.consume(NotificationConsumerService.QUEUE, async (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
        const routingKey = msg.fields.routingKey;
        this.handleNotification(routingKey, payload);
        this.channel!.ack(msg);
      } catch (err) {
        this.logger.error(`Failed to process notification event: ${String(err)}`);
        this.channel!.nack(msg, false, false);
      }
    });

    this.logger.log(`Consuming notification events from queue "${NotificationConsumerService.QUEUE}"`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  private handleNotification(routingKey: string, payload: Record<string, unknown>): void {
    switch (routingKey) {
      case CondogestTicketRoutingKey.TICKET_CREATED:
        this.logger.log(
          `[NOTIFICATION] Ticket criado — residentId: ${String(payload.residentId)}, título: "${String(payload.title)}"`,
        );
        break;
      case CondogestTicketRoutingKey.TICKET_STATUS_CHANGED:
        this.logger.log(
          `[NOTIFICATION] Status do ticket alterado — ticketId: ${String(payload.ticketId)}, ${String(payload.oldStatus)} → ${String(payload.newStatus)}`,
        );
        break;
      case CondogestTicketRoutingKey.MAINTENANCE_COMPLETED:
        this.logger.log(
          `[NOTIFICATION] Manutenção concluída — ticketId: ${String(payload.ticketId)}, valor: R$ ${String(payload.value)}`,
        );
        break;
      case CondogestNotificationRoutingKey.SEND:
        this.logger.log(
          `[NOTIFICATION] Notificação direta — destinatário: ${String(payload.recipientId)}, mensagem: "${String(payload.message)}"`,
        );
        break;
      default:
        this.logger.warn(`[NOTIFICATION] Routing key desconhecida: ${routingKey}`);
    }
  }
}
