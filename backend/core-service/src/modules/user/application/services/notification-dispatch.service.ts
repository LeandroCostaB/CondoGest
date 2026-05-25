import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

interface NotificationPayload {
  to: string;
  channel: 'email' | 'push';
  title: string;
  body: string;
}

@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);

  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  dispatch(payload: NotificationPayload): void {
    this.client.emit('notification.send', payload);
    this.logger.log(`Notificação enviada para: ${payload.to} via ${payload.channel}`);
  }
}
