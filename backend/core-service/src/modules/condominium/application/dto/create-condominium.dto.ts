import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateCondominiumDto {
  @ApiProperty({ example: "Condomínio Central" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "Rua das Flores, 123" })
  @IsString()
  @IsNotEmpty()
  address: string;
}