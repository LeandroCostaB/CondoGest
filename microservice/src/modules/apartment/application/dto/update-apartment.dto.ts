import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class UpdateApartmentDto {
  @ApiPropertyOptional({ example: "102" })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  number?: string;

  @ApiPropertyOptional({ example: "Bloco B" })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  block?: string;

  @ApiPropertyOptional({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  floor?: number;
}
