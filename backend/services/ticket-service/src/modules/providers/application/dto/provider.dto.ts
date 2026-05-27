import { ApiProperty } from "@nestjs/swagger";
import type { Provider, ProviderSpecialty } from "@providers/domain/models/provider.entity";

export class ProviderDto {
  @ApiProperty()
  id: string | undefined;

  @ApiProperty({ example: "Encanamentos Total" })
  name: string;

  @ApiProperty({ example: "(11) 98888-0001" })
  phone: string;

  @ApiProperty({ enum: ["ELECTRICIAN", "PLUMBER", "PAINTER", "CARPENTER", "LOCKSMITH", "GENERAL"] })
  specialty: ProviderSpecialty;

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
  updatedAt: Date | undefined;

  private constructor(p: Provider) {
    this.id = p.id;
    this.name = p.name;
    this.phone = p.phone;
    this.specialty = p.specialty;
    this.createdAt = p.createdAt;
    this.updatedAt = p.updatedAt;
  }

  static from(p: Provider | null): ProviderDto | null {
    if (!p) return null;
    return new ProviderDto(p);
  }
}
