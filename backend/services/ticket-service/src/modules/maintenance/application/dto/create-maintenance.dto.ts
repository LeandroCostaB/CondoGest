import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID } from "class-validator";

export class CreateMaintenanceDto {
  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  ticketId?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  apartmentId?: string | null;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID()
  providerId?: string | null;

  @ApiPropertyOptional({ example: 350.0 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  value?: number;

  @ApiPropertyOptional({ example: "2026-06-15T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  executionDate?: string;
}
