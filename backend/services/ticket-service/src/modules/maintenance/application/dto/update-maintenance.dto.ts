import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from "class-validator";
import { MaintenanceStatus } from "@maintenance/domain/models/maintenance.entity";

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional() @IsUUID()
  providerId?: string;

  @ApiPropertyOptional({ enum: MaintenanceStatus })
  @IsOptional() @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ example: 350.0 })
  @IsOptional() @IsNumber() @IsPositive()
  value?: number;

  @ApiPropertyOptional({ example: "2026-06-15T10:00:00.000Z" })
  @IsOptional() @IsDateString()
  executionDate?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  type?: string | null;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  local?: string | null;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  priority?: string | null;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  providerName?: string | null;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  providerContact?: string | null;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  observation?: string | null;
}
