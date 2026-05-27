import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateCondominiumDto {
  @ApiProperty({ example: "Residencial Aurora" })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: "Rua das Flores, 100 - Vila Madalena - São Paulo/SP" })
  @IsString()
  @MinLength(5)
  address: string;
}
