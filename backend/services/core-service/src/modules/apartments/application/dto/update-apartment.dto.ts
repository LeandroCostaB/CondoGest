import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateApartmentDto {
  @ApiPropertyOptional({ example: "101" })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiPropertyOptional({ example: "A" })
  @IsOptional()
  @IsString()
  block?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  floor?: number;
}
