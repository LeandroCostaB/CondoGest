import type { Apartment } from "@apartment/domain/models/apartment.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ApartmentDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;

  @ApiProperty({ example: "101" })
  number: string;

  @ApiPropertyOptional({ example: "Bloco A", nullable: true })
  block?: string | null;

  @ApiPropertyOptional({ example: 1, nullable: true })
  floor?: number | null;

  @ApiProperty({ example: "uuid" })
  condominiumId: string;

  @ApiPropertyOptional({ example: "uuid", nullable: true })
  userId?: string | null;

  private constructor(
    id: string | undefined,
    number: string,
    block: string | null | undefined,
    floor: number | null | undefined,
    condominiumId: string,
    userId: string | null | undefined,
  ) {
    this.id = id;
    this.number = number;
    this.block = block;
    this.floor = floor;
    this.condominiumId = condominiumId;
    this.userId = userId;
  }

  static from(apartment: Apartment | null): ApartmentDto | null {
    if (!apartment) return null;

    return new ApartmentDto(
      apartment.id,
      apartment.number,
      apartment.block,
      apartment.floor,
      apartment.condominiumId,
      apartment.userId,
    );
  }
}
