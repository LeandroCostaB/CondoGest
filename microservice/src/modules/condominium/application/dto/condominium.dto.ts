import type { Condominium } from "@condominium/domain/models/condominium.entity";
import { ApiProperty } from "@nestjs/swagger";

export class CondominiumDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "Condomínio Central" })
  name: string;

  @ApiProperty({ example: "Rua das Flores, 123" })
  address: string;

  @ApiProperty({ example: "uuid" })
  userId: string;

  @ApiProperty({ example: "active" })
  status: string;

  private constructor(
    id: string | undefined,
    name: string,
    address: string,
    userId: string,
    status: string,
  ) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.userId = userId;
    this.status = status;
  }

  public static from(condominium: Condominium | null): CondominiumDto | null {
    if (!condominium) return null;
    return new CondominiumDto(
      condominium.id,
      condominium.name,
      condominium.address,
      condominium.userId,
      condominium.status,
    );
  }
}