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
    const notifications = this.buildPayloads(routingKey, payload);
    if (notifications.length === 0) return;

    const results = await Promise.allSettled(
      notifications.map((n) => {
        const provider = n.channel === "email" ? this.gmailProvider : this.firebaseProvider;
        return provider.send(n).then((ok) => {
          if (!ok) throw new Error(`Falha ao enviar notificação via ${n.channel}`);
        });
      }),
    );

    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      throw new Error(`${failed.length}/${results.length} notificações falharam`);
    }
  }

  private buildPayloads(routingKey: string, p: Record<string, unknown>): NotificationPayloadDto[] {
    switch (routingKey) {
      case CondogestTicketRoutingKey.TICKET_CREATED: {
        const email = p.residentEmail as string | null;
        const fcm   = p.residentFcmToken as string | null;
        if (!email && !fcm) { this.logger.warn("ticket.created sem destinatário — ignorado."); return []; }
        const title = "Seu chamado foi aberto — CondoGest";
        const body  = this.tmplTicketCreated(p);
        return [
          ...(email ? [this.emailDto(email, title, body)] : []),
          ...(fcm   ? [this.pushDto(fcm, title, `Chamado aberto: ${String(p.title ?? "")}`)] : []),
        ];
      }

      case CondogestTicketRoutingKey.TICKET_STATUS_CHANGED: {
        const email = p.residentEmail as string | null;
        const fcm   = p.residentFcmToken as string | null;
        if (!email && !fcm) { this.logger.warn("ticket.status-changed sem destinatário — ignorado."); return []; }
        const title = "Status do seu chamado atualizado — CondoGest";
        const body  = this.tmplStatusChanged(p);
        const pushBody = `Chamado: ${this.statusLabel(String(p.oldStatus))} → ${this.statusLabel(String(p.newStatus))}`;
        return [
          ...(email ? [this.emailDto(email, title, body)] : []),
          ...(fcm   ? [this.pushDto(fcm, title, pushBody)] : []),
        ];
      }

      case CondogestTicketRoutingKey.MAINTENANCE_COMPLETED: {
        const email = p.residentEmail as string | null;
        const fcm   = p.residentFcmToken as string | null;
        if (!email && !fcm) { this.logger.warn("maintenance.completed sem destinatário — ignorado."); return []; }
        const title = "Manutenção concluída — CondoGest";
        const body  = this.tmplMaintenanceCompleted(p);
        return [
          ...(email ? [this.emailDto(email, title, body)] : []),
          ...(fcm   ? [this.pushDto(fcm, title, "A manutenção do seu apartamento foi concluída ✅")] : []),
        ];
      }

      case CondogestTicketRoutingKey.MAINTENANCE_SCHEDULED: {
        const email = p.residentEmail as string | null;
        const fcm   = p.residentFcmToken as string | null;
        if (!email && !fcm) { this.logger.warn("maintenance.scheduled sem destinatário — ignorado."); return []; }
        const title = "Manutenção agendada — CondoGest";
        const body  = this.tmplMaintenanceScheduled(p);
        return [
          ...(email ? [this.emailDto(email, title, body)] : []),
          ...(fcm   ? [this.pushDto(fcm, title, `Manutenção agendada: ${String(p.type ?? "")}`)] : []),
        ];
      }

      case CondogestTicketRoutingKey.MAINTENANCE_STATUS_CHANGED: {
        const email = p.residentEmail as string | null;
        const fcm   = p.residentFcmToken as string | null;
        if (!email && !fcm) { this.logger.warn("maintenance.status-changed sem destinatário — ignorado."); return []; }
        const title = "Status da manutenção atualizado — CondoGest";
        const body  = this.tmplMaintenanceStatusChanged(p);
        const pushBody = `Manutenção: ${this.maintenanceStatusLabel(String(p.oldStatus))} → ${this.maintenanceStatusLabel(String(p.newStatus))}`;
        return [
          ...(email ? [this.emailDto(email, title, body)] : []),
          ...(fcm   ? [this.pushDto(fcm, title, pushBody)] : []),
        ];
      }

      case CondogestNotificationRoutingKey.SEND: {
        const dto = new NotificationPayloadDto();
        dto.channel = (p.channel as "email" | "push") ?? "email";
        dto.to    = p.to as string;
        dto.title = p.title as string;
        dto.body  = p.body as string;
        dto.data  = p.data as Record<string, string> | undefined;
        return [dto];
      }

      default:
        this.logger.warn(`Routing key desconhecida: ${routingKey}`);
        return [];
    }
  }

  // ── Builders ────────────────────────────────────────────────────────────────

  private emailDto(to: string, title: string, body: string): NotificationPayloadDto {
    const dto = new NotificationPayloadDto();
    dto.channel = "email";
    dto.to = to;
    dto.title = title;
    dto.body = body;
    return dto;
  }

  private pushDto(token: string, title: string, body: string, data?: Record<string, string>): NotificationPayloadDto {
    const dto = new NotificationPayloadDto();
    dto.channel = "push";
    dto.to = token;
    dto.title = title;
    dto.body = body;
    dto.data = data;
    return dto;
  }

  // ── Labels ───────────────────────────────────────────────────────────────────

  private statusLabel(s: string): string {
    const map: Record<string, string> = {
      OPEN: "Aberto", IN_PROGRESS: "Em andamento",
      RESOLVED: "Resolvido", CLOSED: "Fechado", CANCELED: "Cancelado",
    };
    return map[s] ?? s;
  }

  private maintenanceStatusLabel(s: string): string {
    const map: Record<string, string> = {
      SCHEDULED: "Agendada", IN_PROGRESS: "Em andamento",
      COMPLETED: "Concluída", CANCELED: "Cancelada",
    };
    return map[s] ?? s;
  }

  // ── Templates de e-mail ──────────────────────────────────────────────────────

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
    return `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1D1B3A">Olá, ${String(p.residentNome ?? "Morador")}!</h2>
        <p>O status do seu chamado foi atualizado.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Chamado</td><td style="padding:8px">${String(p.ticketId ?? "—")}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Anterior</td><td style="padding:8px">${this.statusLabel(String(p.oldStatus))}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Novo status</td><td style="padding:8px"><strong>${this.statusLabel(String(p.newStatus))}</strong></td></tr>
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

  private tmplMaintenanceScheduled(p: Record<string, unknown>): string {
    const rawDate = p.executionDate as string | null;
    let dateStr = "—";
    if (rawDate) {
      const d = new Date(rawDate);
      dateStr = d.toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short", timeZone: "America/Sao_Paulo" });
    }
    return `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1D1B3A">Olá, ${String(p.residentNome ?? "Morador")}!</h2>
        <p>Uma manutenção foi <strong>agendada</strong> no seu apartamento.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Data e Hora</td><td style="padding:8px">${dateStr}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Tipo</td><td style="padding:8px">${String(p.type ?? "—")}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Status</td><td style="padding:8px">Agendada 📅</td></tr>
        </table>
        <p style="color:#666;font-size:13px">Acompanhe pelo aplicativo CondoGest.</p>
      </div>`;
  }

  private tmplMaintenanceStatusChanged(p: Record<string, unknown>): string {
    return `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <h2 style="color:#1D1B3A">Olá, ${String(p.residentNome ?? "Morador")}!</h2>
        <p>O status da manutenção do seu apartamento foi atualizado.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Status anterior</td><td style="padding:8px">${this.maintenanceStatusLabel(String(p.oldStatus))}</td></tr>
          <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold">Novo status</td><td style="padding:8px"><strong>${this.maintenanceStatusLabel(String(p.newStatus))}</strong></td></tr>
        </table>
        <p style="color:#666;font-size:13px">Acompanhe pelo aplicativo CondoGest.</p>
      </div>`;
  }
}
