import type { Provider } from "@providers/domain/models/provider.entity";

export const PROVIDER_REPOSITORY = Symbol("PROVIDER_REPOSITORY");

export interface ProviderRepository {
  create(provider: Provider): Promise<Provider>;
  findAll(): Promise<Provider[]>;
  findById(id: string): Promise<Provider | null>;
  update(provider: Provider): Promise<void>;
  delete(id: string): Promise<void>;
}
