import { Injectable, Logger } from "@nestjs/common";
import {
  CondogestTicketRoutingKey,
} from "@shared/contracts/events/condogest-ticket-events.enum";
import {
  CondogestNotificationRoutingKey,
} from "@shared/contracts/events/condogest-notification-events.enum";
import { GmailProvider } from "@notification/infra/providers/gmail.provider";
import { FirebaseProvider } from "@notification/infra/providers/firebase.provider";
import { NotificationPayloadDto } from "@notification/application/dto/notification-payload.dto";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly gmailProvider: GmailProvider,
    private readonly firebaseProvider: FirebaseProvider,
  ) {}

  async handle(routingKey: string, payload: Record<string, unknown>): Promise<void> {
    const notification = this.buildPayload(routingKey, payload);
    if (!notification) return;

    const provider = notification.channel === "email" ? this.gmailProvider : this.firebaseProvider;
    const success = await provider.send(notification);
    if (!success) throw new Error(`Falha ao enviar notificação via ${notification.channel}`);
  }

  private buildPayload(routingKey: string, p: Record<string, unknown>): NotificationPayloadDto | null {
    switch (routingKey) {
      case CondogestTicketRoutingKey.TICKET_CREATED: {
        const email = p.residentEmail as string | null;
        if (!email) { this.logger.warn("ticket.created sem residentEmail — e-mail ignorado."); return null; }
        const dto = new NotificationPayloadDto();
        dto.channel = "email";
        dto.to = email;
        dto.title = "Seu chamado foi aberto — CondoGest";
        dto.body = this.tmplTicketCreated(p);
        return dto;
      }

      case CondogestTicketRoutingKey.TICKET_STATUS_CHANGED: {
        const email = p.residentEmail as string | null;
        if (!email) { this.logger.warn("ticket.status-changed sem residentEmail — e-mail ignorado."); return null; }
        const dto = new NotificationPayloadDto();
        dto.channel = "email";
        dto.to = email;
        dto.title = "Status do seu chamado atualizado — CondoGest";
        dto.body = this.tmplStatusChanged(p);
        return dto;
      }

      case CondogestTicketRoutingKey.MAINTENANCE_COMPLETED: {
        const email = p.residentEmail as string | null;
        if (!email) { this.logger.warn("maintenance.completed sem residentEmail — e-mail ignorado."); return null; }
        const dto = new NotificationPayloadDto();
        dto.channel = "email";
        dto.to = email;
        dto.title = "Manutenção concluída — CondoGest";
        dto.body = this.tmplMaintenanceCompleted(p);
        return dto;
      }

      case CondogestNotificationRoutingKey.SEND: {
        const dto = new NotificationPayloadDto();
        dto.channel = (p.channel as "email" | "push") ?? "email";
        dto.to = p.to as string;
        dto.title = p.title as string;
        dto.body = p.body as string;
        dto.data = p.data as Record<string, string> | undefined;
        return dto;
      }

      default:
        this.logger.warn(`Routing key desconhecida: ${routingKey}`);
        return null;
    }
  }

  private tmplTicketCreated(p: Record<string, unknown>): string {
    return `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1D1B3A">Olá, ${String(p.residentNome ?? "Morador")}!</h2>
        <p>Seu chamado foi registrado com sucesso no <strong>CondoGest</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Título</td><td style="padding:8px">${String(p.title ?? "—")}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Local</td><td style="padding:8px">${String(p.location ?? "—")}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Status</td><td style="padding:8px">Aberto</td></tr>
        </table>
        <p style="color:#666;font-size:13px">Acompanhe o andamento pelo aplicativo CondoGest.</p>
      </div>`;
  }

  private tmplStatusChanged(p: Record<string, unknown>): string {
    const statusMap: Record<string, string> = {
      OPEN: "Aberto", IN_PROGRESS: "Em andamento",
      RESOLVED: "Resolvido", CLOSED: "Fechado", CANCELED: "Cancelado",
    };
    const oldLabel = statusMap[String(p.oldStatus)] ?? String(p.oldStatus);
    const newLabel = statusMap[String(p.newStatus)] ?? String(p.newStatus);
    return `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1D1B3A">Olá, ${String(p.residentNome ?? "Morador")}!</h2>
        <p>O status do seu chamado foi atualizado.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Chamado</td><td style="padding:8px">${String(p.ticketId ?? "—")}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Anterior</td><td style="padding:8px">${oldLabel}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Novo status</td><td style="padding:8px"><strong>${newLabel}</strong></td></tr>
        </table>
        <p style="color:#666;font-size:13px">Acompanhe o andamento pelo aplicativo CondoGest.</p>
      </div>`;
  }

  private tmplMaintenanceCompleted(p: Record<string, unknown>): string {
    const value = p.value != null ? `R$ ${Number(p.value).toFixed(2)}` : "—";
    return `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1D1B3A">Olá, ${String(p.residentNome ?? "Morador")}!</h2>
        <p>A manutenção do seu apartamento foi <strong>concluída</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Valor</td><td style="padding:8px">${value}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Status</td><td style="padding:8px">Concluída ✅</td></tr>
        </table>
        <p style="color:#666;font-size:13px">Obrigado por utilizar o CondoGest.</p>
      </div>`;
  }
}
