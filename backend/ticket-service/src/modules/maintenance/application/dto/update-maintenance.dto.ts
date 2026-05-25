import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { MaintenanceStatus } from '../../domain/models/maintenance.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMaintenanceDto {
  @ApiPropertyOptional({ example: 'f6a7b8c9-d0e1-2345-f012-345678901234', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  providerId?: string;

  @ApiPropertyOptional({ enum: MaintenanceStatus, example: MaintenanceStatus.IN_PROGRESS })
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ example: 480.00 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  value?: number;

  @ApiPropertyOptional({ example: '2026-06-05T14:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  executionDate?: string;
}
