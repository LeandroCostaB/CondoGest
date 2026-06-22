import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { Maintenance, MaintenanceStatus } from "@maintenance/domain/models/maintenance.entity";
import type { MaintenanceRepository } from "@maintenance/domain/repositories/maintenance-repository.interface";
import { maintenanceSchema } from "@maintenance/infra/database/schemas/maintenance.schema";

function toEntity(r: typeof maintenanceSchema.$inferSelect): Maintenance {
  return Maintenance.restore({
    ...r,
    status: r.status as MaintenanceStatus,
    value: Number(r.value),
    type: r.type ?? null,
    local: r.local ?? null,
    priority: r.priority ?? null,
    providerName: r.providerName ?? null,
    providerContact: r.providerContact ?? null,
    observation: r.observation ?? null,
  })!;
}

@Injectable()
export class DrizzleMaintenanceRepository implements MaintenanceRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(maintenance: Maintenance): Promise<Maintenance> {
    const [row] = await this.drizzle.db
      .insert(maintenanceSchema)
      .values({
        ticketId: maintenance.ticketId,
        apartmentId: maintenance.apartmentId,
        condominiumId: maintenance.condominiumId,
        providerId: maintenance.providerId,
        status: maintenance.status,
        value: String(maintenance.value),
        executionDate: maintenance.executionDate,
        type: maintenance.type,
        local: maintenance.local,
        priority: maintenance.priority,
        providerName: maintenance.providerName,
        providerContact: maintenance.providerContact,
        observation: maintenance.observation,
      })
      .returning();
    return toEntity(row);
  }

  async findAll(): Promise<Maintenance[]> {
    const rows = await this.drizzle.db.select().from(maintenanceSchema);
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Maintenance | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(maintenanceSchema)
      .where(eq(maintenanceSchema.id, id));
    return row ? toEntity(row) : null;
  }

  async findByTicketId(ticketId: string): Promise<Maintenance[]> {
    const rows = await this.drizzle.db
      .select()
      .from(maintenanceSchema)
      .where(eq(maintenanceSchema.ticketId, ticketId));
    return rows.map(toEntity);
  }

  async findByApartmentId(apartmentId: string): Promise<Maintenance[]> {
    const rows = await this.drizzle.db
      .select()
      .from(maintenanceSchema)
      .where(eq(maintenanceSchema.apartmentId, apartmentId));
    return rows.map(toEntity);
  }

  async findByCondominiumId(condominiumId: string): Promise<Maintenance[]> {
    const rows = await this.drizzle.db
      .select()
      .from(maintenanceSchema)
      .where(eq(maintenanceSchema.condominiumId, condominiumId));
    return rows.map(toEntity);
  }

  async update(maintenance: Maintenance): Promise<void> {
    await this.drizzle.db
      .update(maintenanceSchema)
      .set({
        providerId: maintenance.providerId,
        status: maintenance.status,
        value: String(maintenance.value),
        executionDate: maintenance.executionDate,
        type: maintenance.type,
        local: maintenance.local,
        priority: maintenance.priority,
        providerName: maintenance.providerName,
        providerContact: maintenance.providerContact,
        observation: maintenance.observation,
        updatedAt: new Date(),
      })
      .where(eq(maintenanceSchema.id, maintenance.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db.delete(maintenanceSchema).where(eq(maintenanceSchema.id, id));
  }
}
