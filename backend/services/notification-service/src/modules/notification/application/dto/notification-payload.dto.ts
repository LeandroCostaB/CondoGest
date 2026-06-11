export type NotificationChannel = "push" | "email";

export class NotificationPayloadDto {
  to!: string;
  channel!: NotificationChannel;
  title!: string;
  body!: string;
  data?: Record<string, string>;
}
