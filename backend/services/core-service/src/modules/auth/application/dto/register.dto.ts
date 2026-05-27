import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "João Silva" })
  @IsString()
  nome: string;

  @ApiProperty({ example: "joao@condogest.com" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "senha123" })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({ enum: ["SINDICO", "MORADOR"], default: "MORADOR" })
  @IsOptional()
  @IsIn(["SINDICO", "MORADOR"])
  role?: "SINDICO" | "MORADOR";
}
