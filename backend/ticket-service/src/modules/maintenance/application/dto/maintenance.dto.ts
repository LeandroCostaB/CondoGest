import type { Maintenance } from '../../domain/models/maintenance.entity';
import { MaintenanceStatus } from '../../domain/models/maintenance.entity';

export class MaintenanceDto {
  id: string | undefined;
  ticketId: string;
  providerId: string;
  status: MaintenanceStatus;
  value: number;
  executionDate: Date;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  private constructor(maintenance: Maintenance) {
    this.id = maintenance.id;
    this.ticketId = maintenance.ticketId;
    this.providerId = maintenance.providerId;
    this.status = maintenance.status;
    this.value = maintenance.value;
    this.executionDate = maintenance.executionDate;
    this.createdAt = maintenance.createdAt;
    this.updatedAt = maintenance.updatedAt;
  }

  static from(maintenance: Maintenance | null): MaintenanceDto | null {
    if (!maintenance) return null;
    return new MaintenanceDto(maintenance);
  }
}
