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
import { NotificationService } from "@notification/application/services/notification.service";

@Injectable()
export class NotificationConsumerService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(NotificationConsumerService.name);
  private static readonly QUEUE = "condogest.notification-service.events.queue";

  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationService: NotificationService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const url = this.configService.get<string>("RABBITMQ_URL");
    if (!url) {
      this.logger.warn("RABBITMQ_URL não configurado — consumer desabilitado.");
      return;
    }

    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();

    const bindings = [
      { exchange: CondogestTicketExchangeName.TICKET_CREATED,           key: CondogestTicketRoutingKey.TICKET_CREATED },
      { exchange: CondogestTicketExchangeName.TICKET_STATUS_CHANGED,    key: CondogestTicketRoutingKey.TICKET_STATUS_CHANGED },
      { exchange: CondogestTicketExchangeName.MAINTENANCE_COMPLETED,    key: CondogestTicketRoutingKey.MAINTENANCE_COMPLETED },
      { exchange: CondogestTicketExchangeName.MAINTENANCE_SCHEDULED,    key: CondogestTicketRoutingKey.MAINTENANCE_SCHEDULED },
      { exchange: CondogestTicketExchangeName.MAINTENANCE_STATUS_CHANGED, key: CondogestTicketRoutingKey.MAINTENANCE_STATUS_CHANGED },
      { exchange: CondogestNotificationExchangeName.SEND,               key: CondogestNotificationRoutingKey.SEND },
    ];

    for (const { exchange } of bindings) {
      await this.channel.assertExchange(exchange, "direct", { durable: true });
    }

    await this.channel.assertQueue(NotificationConsumerService.QUEUE, { durable: true });

    for (const { exchange, key } of bindings) {
      await this.channel.bindQueue(NotificationConsumerService.QUEUE, exchange, key);
    }

    await this.channel.consume(NotificationConsumerService.QUEUE, async (msg) => {
      if (!msg) return;
      const routingKey = msg.fields.routingKey;
      try {
        const payload = JSON.parse(msg.content.toString()) as Record<string, unknown>;
        await this.notificationService.handle(routingKey, payload);
        this.channel!.ack(msg);
      } catch (err) {
        this.logger.error(`Falha ao processar evento [${routingKey}]: ${String(err)}`);
        this.channel!.nack(msg, false, false);
      }
    });

    this.logger.log(`Consumindo eventos de notificação da fila "${NotificationConsumerService.QUEUE}"`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
