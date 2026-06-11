import type { NotificationPayloadDto } from "@notification/application/dto/notification-payload.dto";

export interface INotificationProvider {
  send(payload: NotificationPayloadDto): Promise<boolean>;
}
