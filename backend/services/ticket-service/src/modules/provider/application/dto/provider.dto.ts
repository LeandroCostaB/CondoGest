import type { Provider } from '../../domain/models/provider.entity';
import { ProviderSpecialty } from '../../domain/models/provider.entity';

export class ProviderDto {
  id: string | undefined;
  name: string;
  phone: string;
  specialty: ProviderSpecialty;
  createdAt: Date | undefined;
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
