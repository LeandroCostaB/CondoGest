import { Injectable } from '@nestjs/common';
import { RabbitMQService } from '@messaging/infra/rabbitmq/rabbitmq.service';

const CORE_EXCHANGE = 'condogest.core';
const CORE_DATA_ROUTING_KEY = 'core.dados_cadastrais';

@Injectable()
export class MessagingService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async publishCoreEvent(event: string, payload: Record<string, unknown>): Promise<void> {
    const channel = this.rabbitMQService.getChannel();
    channel.publish(
      CORE_EXCHANGE,
      CORE_DATA_ROUTING_KEY,
      Buffer.from(JSON.stringify({ event, payload })),
      { persistent: true },
    );
  }
}
