import { Module } from "@nestjs/common";
import { TICKET_REPOSITORY } from "@tickets/domain/repositories/ticket-repository.interface";
import { DrizzleTicketRepository } from "@tickets/infra/repositories/drizzle-ticket.repository";
import { TicketMessagingService } from "@tickets/application/services/ticket-messaging.service";
import { TicketService } from "@tickets/application/services/ticket.service";
import { TicketController } from "@tickets/infra/controllers/ticket.controller";

@Module({
  providers: [
    DrizzleTicketRepository,
    { provide: TICKET_REPOSITORY, useClass: DrizzleTicketRepository },
    TicketMessagingService,
    TicketService,
  ],
  controllers: [TicketController],
})
export class TicketsModule {}
