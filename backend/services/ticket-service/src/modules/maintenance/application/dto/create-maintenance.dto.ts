import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsUUID } from "class-validator";

export class CreateMaintenanceDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  ticketId: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  providerId: string;

  @ApiProperty({ example: 350.0 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  value: number;

  @ApiProperty({ example: "2026-06-15T10:00:00.000Z" })
  @IsDateString()
  executionDate: string;
}
