import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateApartmentDto {
  @ApiProperty({ example: "101" })
  @IsString()
  @MinLength(1)
  number: string;

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
