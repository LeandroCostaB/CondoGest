import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { MessagingModule } from '../messaging/messaging.module';
import { TicketController } from './infra/controllers/ticket.controller';
import { TicketService } from './application/services/ticket.service';
import { TICKET_REPOSITORY } from './domain/repositories/ticket-repository.interface';
import { DrizzleTicketRepository } from './infra/repositories/drizzle-ticket.repository';

@Module({
  imports: [SharedModule, MessagingModule],
  controllers: [TicketController],
  providers: [
    TicketService,
    {
      provide: TICKET_REPOSITORY,
      useClass: DrizzleTicketRepository,
    },
  ],
  exports: [TicketService, TICKET_REPOSITORY],
})
export class TicketModule {}
