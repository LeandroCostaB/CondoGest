import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "João Silva" })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ example: "joao@condogest.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "novaSenha123" })
  @IsOptional()
  @IsString()
  @MinLength(6)
  senha?: string;
}
