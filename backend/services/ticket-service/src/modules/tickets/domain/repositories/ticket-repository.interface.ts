import type { Ticket } from "@tickets/domain/models/ticket.entity";

export const TICKET_REPOSITORY = Symbol("TICKET_REPOSITORY");

export interface TicketRepository {
  create(ticket: Ticket): Promise<Ticket>;
  findAll(): Promise<Ticket[]>;
  findById(id: string): Promise<Ticket | null>;
  findByResidentId(residentId: string): Promise<Ticket[]>;
  findByApartmentId(apartmentId: string): Promise<Ticket[]>;
  update(ticket: Ticket): Promise<void>;
  delete(id: string): Promise<void>;
}
