import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from "class-validator";
import { MaintenanceStatus } from "@maintenance/domain/models/maintenance.entity";

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsUUID()
  @IsOptional()
  providerId?: string;

  @ApiPropertyOptional({ enum: MaintenanceStatus })
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ example: 350.0 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  value?: number;

  @ApiPropertyOptional({ example: "2026-06-15T10:00:00.000Z" })
  @IsDateString()
  @IsOptional()
  executionDate?: string;
}
