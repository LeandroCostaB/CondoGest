import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateTicketDto {
  @ApiProperty({ example: "Vazamento na cozinha" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: "Torneira com vazamento constante, água escorrendo pelo armário." })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: "Cozinha" })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: "a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce", format: "uuid" })
  @IsUUID()
  apartmentId: string;
}
