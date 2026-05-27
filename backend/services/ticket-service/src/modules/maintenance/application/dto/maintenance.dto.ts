import { ApiProperty } from "@nestjs/swagger";
import type { Maintenance, MaintenanceStatus } from "@maintenance/domain/models/maintenance.entity";

export class MaintenanceDto {
  @ApiProperty()
  id: string | undefined;

  @ApiProperty()
  ticketId: string;

  @ApiProperty()
  providerId: string;

  @ApiProperty({ enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELED"] })
  status: MaintenanceStatus;

  @ApiProperty({ example: 350.0 })
  value: number;

  @ApiProperty()
  executionDate: Date;

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
  updatedAt: Date | undefined;

  private constructor(m: Maintenance) {
    this.id = m.id;
    this.ticketId = m.ticketId;
    this.providerId = m.providerId;
    this.status = m.status;
    this.value = m.value;
    this.executionDate = m.executionDate;
    this.createdAt = m.createdAt;
    this.updatedAt = m.updatedAt;
  }

  static from(m: Maintenance | null): MaintenanceDto | null {
    if (!m) return null;
    return new MaintenanceDto(m);
  }
}
