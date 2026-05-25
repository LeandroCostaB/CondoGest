import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceDto {
  @ApiProperty({ example: 'b8c9d0e1-f2a3-4567-1234-567890123456', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  ticketId: string;

  @ApiProperty({ example: 'e5f6a7b8-c9d0-1234-ef01-234567890123', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  providerId: string;

  @ApiProperty({ example: 350.00 })
  @IsNumber()
  @IsPositive()
  value: number;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  @IsDateString()
  executionDate: string;
}
