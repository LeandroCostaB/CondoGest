import type { Maintenance } from '../../domain/models/maintenance.entity';
import { MaintenanceStatus } from '../../domain/models/maintenance.entity';
import { ApiProperty } from '@nestjs/swagger';

export class MaintenanceDto {
  @ApiProperty({ example: 'e1f2a3b4-c5d6-7890-4567-890123456789' })
  id: string | undefined;

  @ApiProperty({ example: 'b8c9d0e1-f2a3-4567-1234-567890123456' })
  ticketId: string;

  @ApiProperty({ example: 'e5f6a7b8-c9d0-1234-ef01-234567890123' })
  providerId: string;

  @ApiProperty({ enum: MaintenanceStatus, example: MaintenanceStatus.SCHEDULED })
  status: MaintenanceStatus;

  @ApiProperty({ example: 350.00 })
  value: number;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  executionDate: Date;

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
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
