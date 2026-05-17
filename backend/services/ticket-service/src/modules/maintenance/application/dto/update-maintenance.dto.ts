import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { MaintenanceStatus } from '../../domain/models/maintenance.entity';

export class UpdateMaintenanceDto {
  @IsUUID()
  @IsOptional()
  providerId?: string;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  value?: number;

  @IsDateString()
  @IsOptional()
  executionDate?: string;
}
