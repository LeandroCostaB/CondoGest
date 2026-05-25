import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel, Message } from 'amqplib'; // <-- 1. Importação adicionada aqui
import { NotificationService } from '../../application/services/notification.service';
import { NotificationPayloadDto } from '../../application/dto/notification-payload.dto';

@Controller()
export class NotificationController {
    private readonly logger = new Logger(NotificationController.name);

    constructor(private readonly notificationService: NotificationService) { }

    @EventPattern('notification.send')
    async handleNotification(
        @Payload() payload: NotificationPayloadDto,
        @Ctx() context: RmqContext,
    ) {
        const channel = context.getChannelRef() as Channel;
        const originalMsg = context.getMessage() as Message;

        try {
            await this.notificationService.processNotification(payload);
            channel.ack(originalMsg); // Agora o TypeScript já sabe que o 'ack' existe!
        } catch (error) {
            this.logger.error('Erro no processamento. Rejeitando mensagem.', error);
            channel.nack(originalMsg, false, false); // E sabe que o 'nack' também existe
        }
    }
}