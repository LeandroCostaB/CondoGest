import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateResidentDto {
  @IsString()
  @IsNotEmpty({ message: "O nome é obrigatório." })
  nome!: string;

  @IsEmail({}, { message: "Forneça um e-mail válido." })
  @IsNotEmpty()
  email!: string;
}
