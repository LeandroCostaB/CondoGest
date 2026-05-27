import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class CreateResidentDto {
  @ApiProperty({ example: "João Morador" })
  @IsString()
  nome: string;

  @ApiProperty({ example: "joao@condogest.com" })
  @IsEmail()
  email: string;
}
