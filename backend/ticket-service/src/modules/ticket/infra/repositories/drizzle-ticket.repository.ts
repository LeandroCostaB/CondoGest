import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '@shared/infra/database/drizzle.service';
import { Ticket, TicketStatus } from '../../domain/models/ticket.entity';
import type { TicketRepository } from '../../domain/repositories/ticket-repository.interface';
import { ticketsSchema } from '../database/schemas/ticket.schema';

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
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return this.toEntity(row);
  }

  async findAll(): Promise<Ticket[]> {
    const rows = await this.drizzle.db.select().from(ticketsSchema);
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<Ticket | null> {
    const rows = await this.drizzle.db
      .select()
      .from(ticketsSchema)
      .where(eq(ticketsSchema.id, id))
      .limit(1);
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async findByResidentId(residentId: string): Promise<Ticket[]> {
    const rows = await this.drizzle.db
      .select()
      .from(ticketsSchema)
      .where(eq(ticketsSchema.residentId, residentId));
    return rows.map((row) => this.toEntity(row));
  }

  async findByApartmentId(apartmentId: string): Promise<Ticket[]> {
    const rows = await this.drizzle.db
      .select()
      .from(ticketsSchema)
      .where(eq(ticketsSchema.apartmentId, apartmentId));
    return rows.map((row) => this.toEntity(row));
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
    await this.drizzle.db
      .delete(ticketsSchema)
      .where(eq(ticketsSchema.id, id));
  }

  private toEntity(row: typeof ticketsSchema.$inferSelect): Ticket {
    return Ticket.restore({
      id: row.id,
      title: row.title,
      description: row.description,
      location: row.location,
      status: row.status as TicketStatus,
      residentId: row.residentId,
      apartmentId: row.apartmentId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })!;
  }
}
