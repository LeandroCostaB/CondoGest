import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '@shared/infra/database/drizzle.service';
import { Maintenance, MaintenanceStatus } from '../../domain/models/maintenance.entity';
import type { MaintenanceRepository } from '../../domain/repositories/maintenance-repository.interface';
import { maintenanceSchema } from '../database/schemas/maintenance.schema';

@Injectable()
export class DrizzleMaintenanceRepository implements MaintenanceRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(maintenance: Maintenance): Promise<Maintenance> {
    const [row] = await this.drizzle.db
      .insert(maintenanceSchema)
      .values({
        ticketId: maintenance.ticketId,
        providerId: maintenance.providerId,
        status: maintenance.status,
        value: String(maintenance.value),
        executionDate: maintenance.executionDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return this.toEntity(row);
  }

  async findAll(): Promise<Maintenance[]> {
    const rows = await this.drizzle.db.select().from(maintenanceSchema);
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<Maintenance | null> {
    const rows = await this.drizzle.db
      .select()
      .from(maintenanceSchema)
      .where(eq(maintenanceSchema.id, id))
      .limit(1);
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async findByTicketId(ticketId: string): Promise<Maintenance[]> {
    const rows = await this.drizzle.db
      .select()
      .from(maintenanceSchema)
      .where(eq(maintenanceSchema.ticketId, ticketId));
    return rows.map((row) => this.toEntity(row));
  }

  async update(maintenance: Maintenance): Promise<void> {
    await this.drizzle.db
      .update(maintenanceSchema)
      .set({
        ticketId: maintenance.ticketId,
        providerId: maintenance.providerId,
        status: maintenance.status,
        value: String(maintenance.value),
        executionDate: maintenance.executionDate,
        updatedAt: new Date(),
      })
      .where(eq(maintenanceSchema.id, maintenance.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db
      .delete(maintenanceSchema)
      .where(eq(maintenanceSchema.id, id));
  }

  private toEntity(row: typeof maintenanceSchema.$inferSelect): Maintenance {
    return Maintenance.restore({
      id: row.id,
      ticketId: row.ticketId,
      providerId: row.providerId,
      status: row.status as MaintenanceStatus,
      value: parseFloat(row.value),
      executionDate: row.executionDate,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })!;
  }
}
