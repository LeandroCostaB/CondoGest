import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateCondominiumDto {
  @ApiProperty({ example: "Condomínio Central Atualizado", required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: "Rua das Flores, 456", required: false })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  address?: string;
}
