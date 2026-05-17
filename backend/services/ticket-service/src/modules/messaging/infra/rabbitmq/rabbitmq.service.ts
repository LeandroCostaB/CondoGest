import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Channel, ChannelModel } from 'amqplib';
import amqplib from 'amqplib';
import {
  CORE_DATA_QUEUE,
  CORE_EXCHANGE,
  CORE_RESPONSE_QUEUE,
  CORE_ROUTING_KEY,
  EXCHANGE_TYPE,
  MAINTENANCE_COMPLETED_QUEUE,
  MAINTENANCE_EXCHANGE,
  TICKET_CREATED_QUEUE,
  TICKET_EXCHANGE,
  TICKET_STATUS_CHANGED_QUEUE,
} from '../../messaging.constants';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection!: ChannelModel;
  private channel!: Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.getOrThrow<string>('RABBITMQ_URL');
    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();

    await this.setupInfrastructure();

    this.logger.log('RabbitMQ conectado e infraestrutura configurada');
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  getChannel(): Channel {
    return this.channel;
  }

  private async setupInfrastructure(): Promise<void> {
    // Exchanges
    await this.channel.assertExchange(TICKET_EXCHANGE, EXCHANGE_TYPE, { durable: true });
    await this.channel.assertExchange(MAINTENANCE_EXCHANGE, EXCHANGE_TYPE, { durable: true });
    await this.channel.assertExchange(CORE_EXCHANGE, EXCHANGE_TYPE, { durable: true });

    // Filas publicadas por este serviço
    await this.assertQueue(TICKET_CREATED_QUEUE, TICKET_EXCHANGE, TICKET_CREATED_QUEUE);
    await this.assertQueue(TICKET_STATUS_CHANGED_QUEUE, TICKET_EXCHANGE, TICKET_STATUS_CHANGED_QUEUE);
    await this.assertQueue(MAINTENANCE_COMPLETED_QUEUE, MAINTENANCE_EXCHANGE, MAINTENANCE_COMPLETED_QUEUE);

    // Filas consumidas do core-service
    await this.assertQueue(CORE_DATA_QUEUE, CORE_EXCHANGE, CORE_ROUTING_KEY);
    await this.assertQueue(CORE_RESPONSE_QUEUE, CORE_EXCHANGE, CORE_RESPONSE_QUEUE);
  }

  private async assertQueue(queue: string, exchange: string, routingKey: string): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, routingKey);
  }
}
