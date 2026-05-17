import { Injectable } from '@nestjs/common';
import { CORE_EXCHANGE, CORE_ROUTING_KEY } from '@shared/contracts/events/messaging.constants';
import { RabbitMQService } from '@messaging/infra/rabbitmq/rabbitmq.service';

@Injectable()
export class MessagingService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  publishCoreEvent(event: string, payload: Record<string, unknown>): void {
    const channel = this.rabbitMQService.getChannel();
    channel.publish(
      CORE_EXCHANGE,
      CORE_ROUTING_KEY,
      Buffer.from(JSON.stringify({ event, payload })),
      { persistent: true },
    );
  }
}
