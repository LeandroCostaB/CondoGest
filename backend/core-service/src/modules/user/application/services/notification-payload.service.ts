import { Injectable } from "@nestjs/common";

type NotificationChannel = "email" | "sms";

interface NotificationPayloadParams {
  to: string;
  channel: NotificationChannel;
  title: string;
  body: string;
}

@Injectable()
export class NotificationPayloadService {
  build({ to, channel, title, body }: NotificationPayloadParams) {
    return {
      pattern: "notification.send",
      data: {
        to,
        channel,
        title,
        body,
      },
    };
  }
}
