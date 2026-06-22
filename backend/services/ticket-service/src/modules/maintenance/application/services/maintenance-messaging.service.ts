import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  CondogestTicketExchangeName,
  CondogestTicketRoutingKey,
} from "@shared/contracts/events/condogest-ticket-events.enum";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import { residentSnapshotSchema } from "@core-consumer/infra/database/schemas/resident-snapshot.schema";
import { ticketsSchema } from "@tickets/infra/database/schemas/ticket.schema";
import type { MaintenanceDto } from "@maintenance/application/dto/maintenance.dto";

type ResidentInfo = { email: string; nome: string; residentId: string; fcmToken: string | null };

@Injectable()
export class MaintenanceMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MaintenanceMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
    private readonly drizzle: DrizzleService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.sharedMessagingService.assertExchange(CondogestTicketExchangeName.MAINTENANCE_COMPLETED);
      await this.sharedMessagingService.assertExchange(CondogestTicketExchangeName.MAINTENANCE_SCHEDULED);
      await this.sharedMessagingService.assertExchange(CondogestTicketExchangeName.MAINTENANCE_STATUS_CHANGED);
    } catch (error) {
      this.logger.error("Failed to assert maintenance exchanges", error);
      throw error;
    }
  }

  private async getResidentInfoFromTicket(ticketId: string): Promise<ResidentInfo | null> {
    const [ticket] = await this.drizzle.db
      .select({ residentId: ticketsSchema.residentId })
      .from(ticketsSchema)
      .where(eq(ticketsSchema.id, ticketId));
    if (!ticket) return null;

    const [resident] = await this.drizzle.db
      .select({
        email: residentSnapshotSchema.email,
        nome: residentSnapshotSchema.nome,
        fcmToken: residentSnapshotSchema.fcmToken,
      })
      .from(residentSnapshotSchema)
      .where(eq(residentSnapshotSchema.id, ticket.residentId));
    if (!resident) return null;

    return { ...resident, residentId: ticket.residentId, fcmToken: resident.fcmToken ?? null };
  }

  private async getResidentInfoForMaintenance(maintenance: MaintenanceDto): Promise<ResidentInfo | null> {
    if (maintenance.ticketId) {
      return this.getResidentInfoFromTicket(maintenance.ticketId).catch(() => null);
    }
    return null;
  }

  async publishMaintenanceCompleted(maintenance: MaintenanceDto): Promise<void> {
    const r = await this.getResidentInfoForMaintenance(maintenance);

    await this.sharedMessagingService.publish(
      CondogestTicketExchangeName.MAINTENANCE_COMPLETED,
      CondogestTicketRoutingKey.MAINTENANCE_COMPLETED,
      {
        ...maintenance,
        residentId: r?.residentId ?? null,
        residentEmail: r?.email ?? null,
        residentNome: r?.nome ?? null,
        residentFcmToken: r?.fcmToken ?? null,
      },
    );
  }

  async publishMaintenanceScheduled(maintenance: MaintenanceDto): Promise<void> {
    const r = await this.getResidentInfoForMaintenance(maintenance);
    if (!r) {
      this.logger.warn(`maintenance.scheduled sem residentInfo — notificação ignorada para maintenance ${maintenance.id}`);
      return;
    }

    await this.sharedMessagingService.publish(
      CondogestTicketExchangeName.MAINTENANCE_SCHEDULED,
      CondogestTicketRoutingKey.MAINTENANCE_SCHEDULED,
      {
        ...maintenance,
        residentId: r.residentId,
        residentEmail: r.email,
        residentNome: r.nome,
        residentFcmToken: r.fcmToken,
      },
    );
  }

  async publishMaintenanceStatusChanged(maintenance: MaintenanceDto, oldStatus: string): Promise<void> {
    const r = await this.getResidentInfoForMaintenance(maintenance);
    if (!r) {
      this.logger.warn(`maintenance.status-changed sem residentInfo — notificação ignorada para maintenance ${maintenance.id}`);
      return;
    }

    await this.sharedMessagingService.publish(
      CondogestTicketExchangeName.MAINTENANCE_STATUS_CHANGED,
      CondogestTicketRoutingKey.MAINTENANCE_STATUS_CHANGED,
      {
        maintenanceId: maintenance.id,
        oldStatus,
        newStatus: maintenance.status,
        executionDate: maintenance.executionDate,
        residentId: r.residentId,
        residentEmail: r.email,
        residentNome: r.nome,
        residentFcmToken: r.fcmToken,
      },
    );
  }
}
