import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { eq } from "drizzle-orm";
import {
  CondogestTicketExchangeName,
  CondogestTicketRoutingKey,
} from "@shared/contracts/events/condogest-ticket-events.enum";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import { residentSnapshotSchema } from "@core-consumer/infra/database/schemas/resident-snapshot.schema";
import type { TicketDto } from "@tickets/application/dto/ticket.dto";

@Injectable()
export class TicketMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TicketMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
    private readonly drizzle: DrizzleService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(CondogestTicketExchangeName.TICKET_CREATED),
        this.sharedMessagingService.assertExchange(CondogestTicketExchangeName.TICKET_STATUS_CHANGED),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert ticket exchanges", error);
      throw error;
    }
  }

  private async getResidentInfo(residentId: string): Promise<{ email: string; nome: string; fcmToken: string | null } | null> {
    const [row] = await this.drizzle.db
      .select({
        email: residentSnapshotSchema.email,
        nome: residentSnapshotSchema.nome,
        fcmToken: residentSnapshotSchema.fcmToken,
      })
      .from(residentSnapshotSchema)
      .where(eq(residentSnapshotSchema.id, residentId));
    return row ? { ...row, fcmToken: row.fcmToken ?? null } : null;
  }

  async publishTicketCreated(ticket: TicketDto): Promise<void> {
    const resident = await this.getResidentInfo(ticket.residentId);
    await this.sharedMessagingService.publish(
      CondogestTicketExchangeName.TICKET_CREATED,
      CondogestTicketRoutingKey.TICKET_CREATED,
      {
        ...ticket,
        residentEmail: resident?.email ?? null,
        residentNome: resident?.nome ?? null,
        residentFcmToken: resident?.fcmToken ?? null,
      },
    );
  }

  async publishTicketStatusChanged(
    ticketId: string,
    residentId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    const resident = await this.getResidentInfo(residentId);
    await this.sharedMessagingService.publish(
      CondogestTicketExchangeName.TICKET_STATUS_CHANGED,
      CondogestTicketRoutingKey.TICKET_STATUS_CHANGED,
      {
        ticketId,
        residentId,
        residentEmail: resident?.email ?? null,
        residentNome: resident?.nome ?? null,
        residentFcmToken: resident?.fcmToken ?? null,
        oldStatus,
        newStatus,
        changedAt: new Date().toISOString(),
      },
    );
  }
}
