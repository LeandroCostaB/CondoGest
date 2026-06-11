import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { Ticket, TicketStatus } from "@tickets/domain/models/ticket.entity";
import type { TicketRepository } from "@tickets/domain/repositories/ticket-repository.interface";
import { ticketsSchema } from "@tickets/infra/database/schemas/ticket.schema";
import { apartmentSnapshotSchema } from "@core-consumer/infra/database/schemas/apartment-snapshot.schema";

@Injectable()
export class DrizzleTicketRepository implements TicketRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(ticket: Ticket): Promise<Ticket> {
    const [row] = await this.drizzle.db
      .insert(ticketsSchema)
      .values({
        title: ticket.title,
        description: ticket.description,
        location: ticket.location,
        status: ticket.status,
        residentId: ticket.residentId,
        apartmentId: ticket.apartmentId,
      })
      .returning();
    return Ticket.restore({ ...row, status: row.status as TicketStatus })!;
  }

  async findAll(): Promise<Ticket[]> {
    const rows = await this.drizzle.db.select().from(ticketsSchema);
    return rows.map((r) => Ticket.restore({ ...r, status: r.status as TicketStatus })!);
  }

  async findById(id: string): Promise<Ticket | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(ticketsSchema)
      .where(eq(ticketsSchema.id, id));
    if (!row) return null;
    return Ticket.restore({ ...row, status: row.status as TicketStatus })!;
  }

  async findByResidentId(residentId: string): Promise<Ticket[]> {
    const rows = await this.drizzle.db
      .select()
      .from(ticketsSchema)
      .where(eq(ticketsSchema.residentId, residentId));
    return rows.map((r) => Ticket.restore({ ...r, status: r.status as TicketStatus })!);
  }

  async findByApartmentId(apartmentId: string): Promise<Ticket[]> {
    const rows = await this.drizzle.db
      .select()
      .from(ticketsSchema)
      .where(eq(ticketsSchema.apartmentId, apartmentId));
    return rows.map((r) => Ticket.restore({ ...r, status: r.status as TicketStatus })!);
  }

  async findByCondominiumId(condominiumId: string): Promise<Ticket[]> {
    const rows = await this.drizzle.db
      .select({ ticket: ticketsSchema })
      .from(ticketsSchema)
      .innerJoin(
        apartmentSnapshotSchema,
        eq(ticketsSchema.apartmentId, apartmentSnapshotSchema.id),
      )
      .where(eq(apartmentSnapshotSchema.condominiumId, condominiumId));
    return rows.map((r) => Ticket.restore({ ...r.ticket, status: r.ticket.status as TicketStatus })!);
  }

  async update(ticket: Ticket): Promise<void> {
    await this.drizzle.db
      .update(ticketsSchema)
      .set({
        title: ticket.title,
        description: ticket.description,
        location: ticket.location,
        status: ticket.status,
        updatedAt: new Date(),
      })
      .where(eq(ticketsSchema.id, ticket.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db.delete(ticketsSchema).where(eq(ticketsSchema.id, id));
  }
}
