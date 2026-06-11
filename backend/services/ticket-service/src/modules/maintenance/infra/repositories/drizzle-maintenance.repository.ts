import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { Maintenance, MaintenanceStatus } from "@maintenance/domain/models/maintenance.entity";
import type { MaintenanceRepository } from "@maintenance/domain/repositories/maintenance-repository.interface";
import { maintenanceSchema } from "@maintenance/infra/database/schemas/maintenance.schema";

@Injectable()
export class DrizzleMaintenanceRepository implements MaintenanceRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(maintenance: Maintenance): Promise<Maintenance> {
    const [row] = await this.drizzle.db
      .insert(maintenanceSchema)
      .values({
        ticketId: maintenance.ticketId,
        apartmentId: maintenance.apartmentId,
        providerId: maintenance.providerId,
        status: maintenance.status,
        value: String(maintenance.value),
        executionDate: maintenance.executionDate,
      })
      .returning();
    return Maintenance.restore({
      ...row,
      status: row.status as MaintenanceStatus,
      value: Number(row.value),
    })!;
  }

  async findAll(): Promise<Maintenance[]> {
    const rows = await this.drizzle.db.select().from(maintenanceSchema);
    return rows.map((r) => Maintenance.restore({ ...r, status: r.status as MaintenanceStatus, value: Number(r.value) })!);
  }

  async findById(id: string): Promise<Maintenance | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(maintenanceSchema)
      .where(eq(maintenanceSchema.id, id));
    if (!row) return null;
    return Maintenance.restore({ ...row, status: row.status as MaintenanceStatus, value: Number(row.value) })!;
  }

  async findByTicketId(ticketId: string): Promise<Maintenance[]> {
    const rows = await this.drizzle.db
      .select()
      .from(maintenanceSchema)
      .where(eq(maintenanceSchema.ticketId, ticketId));
    return rows.map((r) => Maintenance.restore({ ...r, status: r.status as MaintenanceStatus, value: Number(r.value) })!);
  }

  async findByApartmentId(apartmentId: string): Promise<Maintenance[]> {
    const rows = await this.drizzle.db
      .select()
      .from(maintenanceSchema)
      .where(eq(maintenanceSchema.apartmentId, apartmentId));
    return rows.map((r) => Maintenance.restore({ ...r, status: r.status as MaintenanceStatus, value: Number(r.value) })!);
  }

  async update(maintenance: Maintenance): Promise<void> {
    await this.drizzle.db
      .update(maintenanceSchema)
      .set({
        providerId: maintenance.providerId,
        status: maintenance.status,
        value: String(maintenance.value),
        executionDate: maintenance.executionDate,
        updatedAt: new Date(),
      })
      .where(eq(maintenanceSchema.id, maintenance.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db.delete(maintenanceSchema).where(eq(maintenanceSchema.id, id));
  }
}
