import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CreateApartmentDto {
  @ApiProperty({ example: "101" })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({ example: "Bloco A" })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  block?: string;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  floor?: number;
}
