export type NotificationChannel = 'push' | 'email';

export class NotificationPayloadDto {
    to!: string; // Pode ser um E-mail (para smtp) ou um Device Token (para push)
    channel!: NotificationChannel;
    title!: string;
    body!: string;
    data?: Record<string, string>; // Dados extras invisíveis (ex: rotas para o Flutter)
}