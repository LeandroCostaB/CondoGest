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
    } catch (error) {
      this.logger.error("Failed to assert maintenance exchanges", error);
      throw error;
    }
  }

  private async getResidentInfoFromTicket(ticketId: string): Promise<{ email: string; nome: string; residentId: string } | null> {
    const [ticket] = await this.drizzle.db
      .select({ residentId: ticketsSchema.residentId })
      .from(ticketsSchema)
      .where(eq(ticketsSchema.id, ticketId));
    if (!ticket) return null;

    const [resident] = await this.drizzle.db
      .select({ email: residentSnapshotSchema.email, nome: residentSnapshotSchema.nome })
      .from(residentSnapshotSchema)
      .where(eq(residentSnapshotSchema.id, ticket.residentId));
    if (!resident) return null;

    return { ...resident, residentId: ticket.residentId };
  }

  async publishMaintenanceCompleted(maintenance: MaintenanceDto): Promise<void> {
    let residentInfo: { email: string; nome: string; residentId: string } | null = null;
    if (maintenance.ticketId) {
      residentInfo = await this.getResidentInfoFromTicket(maintenance.ticketId).catch(() => null);
    }

    await this.sharedMessagingService.publish(
      CondogestTicketExchangeName.MAINTENANCE_COMPLETED,
      CondogestTicketRoutingKey.MAINTENANCE_COMPLETED,
      {
        ...maintenance,
        residentId: residentInfo?.residentId ?? null,
        residentEmail: residentInfo?.email ?? null,
        residentNome: residentInfo?.nome ?? null,
      },
    );
  }
}
