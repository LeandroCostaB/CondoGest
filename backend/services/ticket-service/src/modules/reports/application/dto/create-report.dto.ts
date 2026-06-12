import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ReportType } from "@reports/domain/models/report.entity";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from "class-validator";

export class CreateReportDto {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  @IsNotEmpty()
  condominiumId: string;

  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  month?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  endDate?: string;
}
