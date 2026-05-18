import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateMaintenanceDto {
  @IsUUID()
  @IsNotEmpty()
  ticketId: string;

  @IsUUID()
  @IsNotEmpty()
  providerId: string;

  @IsNumber()
  @IsPositive()
  value: number;

  @IsDateString()
  executionDate: string;
}
