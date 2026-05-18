import { NotificationPayloadDto } from '../../application/dto/notification-payload.dto';

export interface INotificationProvider {
    send(payload: NotificationPayloadDto): Promise<boolean>;
}