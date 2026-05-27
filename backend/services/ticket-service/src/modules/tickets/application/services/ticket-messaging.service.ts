import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  CondogestTicketExchangeName,
  CondogestTicketRoutingKey,
} from "@shared/contracts/events/condogest-ticket-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import type { TicketDto } from "@tickets/application/dto/ticket.dto";

@Injectable()
export class TicketMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TicketMessagingService.name);

  constructor(private readonly sharedMessagingService: SharedMessagingService) {}

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

  async publishTicketCreated(ticket: TicketDto): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestTicketExchangeName.TICKET_CREATED,
      CondogestTicketRoutingKey.TICKET_CREATED,
      ticket,
    );
  }

  async publishTicketStatusChanged(
    ticketId: string,
    residentId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestTicketExchangeName.TICKET_STATUS_CHANGED,
      CondogestTicketRoutingKey.TICKET_STATUS_CHANGED,
      { ticketId, residentId, oldStatus, newStatus, changedAt: new Date().toISOString() },
    );
  }
}
