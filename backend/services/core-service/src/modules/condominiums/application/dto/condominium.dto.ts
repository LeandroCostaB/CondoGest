import { ApiProperty } from "@nestjs/swagger";
import type { Condominium } from "@condominiums/domain/models/condominium.entity";

export class CondominiumDto {
  @ApiProperty()
  id: string | undefined;

  @ApiProperty({ example: "Residencial Aurora" })
  name: string;

  @ApiProperty({ example: "Rua das Flores, 100 - Vila Madalena - São Paulo/SP" })
  address: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ["active", "inactive"] })
  status: string;

  private constructor(c: Condominium) {
    this.id = c.id;
    this.name = c.name;
    this.address = c.address;
    this.userId = c.userId;
    this.status = c.status;
  }

  static from(c: Condominium | null): CondominiumDto | null {
    if (!c) return null;
    return new CondominiumDto(c);
  }
}
