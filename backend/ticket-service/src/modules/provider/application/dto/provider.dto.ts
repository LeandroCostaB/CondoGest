import type { Provider } from '../../domain/models/provider.entity';
import { ProviderSpecialty } from '../../domain/models/provider.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ProviderDto {
  @ApiProperty({ example: 'e5f6a7b8-c9d0-1234-ef01-234567890123' })
  id: string | undefined;

  @ApiProperty({ example: 'Encanamentos Total' })
  name: string;

  @ApiProperty({ example: '(11) 98888-0001' })
  phone: string;

  @ApiProperty({ enum: ProviderSpecialty, example: ProviderSpecialty.PLUMBER })
  specialty: ProviderSpecialty;

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
  updatedAt: Date | undefined;

  private constructor(provider: Provider) {
    this.id = provider.id;
    this.name = provider.name;
    this.phone = provider.phone;
    this.specialty = provider.specialty;
    this.createdAt = provider.createdAt;
    this.updatedAt = provider.updatedAt;
  }

  static from(provider: Provider | null): ProviderDto | null {
    if (!provider) return null;
    return new ProviderDto(provider);
  }
}
