import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type {
  Report,
  ReportStatus,
  ReportType,
} from "@reports/domain/models/report.entity";

export class ReportDto {
  @ApiProperty()
  id: string | undefined;

  @ApiProperty({ format: "uuid" })
  condominiumId: string;

  @ApiProperty({ enum: ["MONTHLY", "CUSTOM"] })
  type: ReportType;

  @ApiProperty({ enum: ["PENDING", "GENERATED", "EXPORTED"] })
  status: ReportStatus;

  @ApiPropertyOptional()
  month?: number;

  @ApiPropertyOptional()
  year?: number;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  data?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
  updatedAt: Date | undefined;

  private constructor(r: Report) {
    this.id = r.id;
    this.condominiumId = r.condominiumId;
    this.type = r.type;
    this.status = r.status;
    this.month = r.month;
    this.year = r.year;
    this.startDate = r.startDate;
    this.endDate = r.endDate;
    this.data = r.data;
    this.createdAt = r.createdAt;
    this.updatedAt = r.updatedAt;
  }

  static from(r: Report | null): ReportDto | null {
    if (!r) return null;
    return new ReportDto(r);
  }
}
