import { Injectable } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class MessagingService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  publish(exchange: string, routingKey: string, payload: Record<string, unknown>): void {
    const channel = this.rabbitMQService.getChannel();
    channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  }
}
