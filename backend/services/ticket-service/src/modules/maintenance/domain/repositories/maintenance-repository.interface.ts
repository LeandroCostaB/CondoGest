import type { Maintenance } from "@maintenance/domain/models/maintenance.entity";

export const MAINTENANCE_REPOSITORY = Symbol("MAINTENANCE_REPOSITORY");

export interface MaintenanceRepository {
  create(maintenance: Maintenance): Promise<Maintenance>;
  findAll(): Promise<Maintenance[]>;
  findById(id: string): Promise<Maintenance | null>;
  findByTicketId(ticketId: string): Promise<Maintenance[]>;
  findByApartmentId(apartmentId: string): Promise<Maintenance[]>;
  findByCondominiumId(condominiumId: string): Promise<Maintenance[]>;
  update(maintenance: Maintenance): Promise<void>;
  delete(id: string): Promise<void>;
}
