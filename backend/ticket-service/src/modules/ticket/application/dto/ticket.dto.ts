import type { Ticket } from '../../domain/models/ticket.entity';
import { TicketStatus } from '../../domain/models/ticket.entity';

export class TicketDto {
  id: string | undefined;
  title: string;
  description: string;
  location: string;
  status: TicketStatus;
  residentId: string;
  apartmentId: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  private constructor(ticket: Ticket) {
    this.id = ticket.id;
    this.title = ticket.title;
    this.description = ticket.description;
    this.location = ticket.location;
    this.status = ticket.status;
    this.residentId = ticket.residentId;
    this.apartmentId = ticket.apartmentId;
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;
  }

  static from(ticket: Ticket | null): TicketDto | null {
    if (!ticket) return null;
    return new TicketDto(ticket);
  }
}
