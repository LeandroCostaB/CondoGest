import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateCondominiumDto {
  @ApiPropertyOptional({ example: "Condomínio Central Atualizado" })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: "Rua das Flores, 456" })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address?: string;
}
