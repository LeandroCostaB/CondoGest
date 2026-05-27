import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { Apartment } from "@apartments/domain/models/apartment.entity";

export class ApartmentDto {
  @ApiProperty()
  id: string | undefined;

  @ApiProperty({ example: "101" })
  number: string;

  @ApiPropertyOptional({ example: "A" })
  block: string | null | undefined;

  @ApiPropertyOptional({ example: 1 })
  floor: number | null | undefined;

  @ApiProperty()
  condominiumId: string;

  private constructor(a: Apartment) {
    this.id = a.id;
    this.number = a.number;
    this.block = a.block;
    this.floor = a.floor;
    this.condominiumId = a.condominiumId;
  }

  static from(a: Apartment | null): ApartmentDto | null {
    if (!a) return null;
    return new ApartmentDto(a);
  }
}
