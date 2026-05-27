import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCondominiumDto {
  @ApiPropertyOptional({ example: "Residencial Aurora" })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: "Rua das Flores, 100 - Vila Madalena - São Paulo/SP" })
  @IsOptional()
  @IsString()
  @MinLength(5)
  address?: string;
}
