import type { Apartment } from "@apartment/domain/models/apartment.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const APARTMENT_REPOSITORY = Symbol("APARTMENT_REPOSITORY");

export interface ApartmentRepository {
  create(apartment: Apartment): Promise<Apartment>;
  findAllByCondominiumId(condominiumId: string): Promise<Apartment[]>;
  findAllByCondominiumIdPaginated(
    condominiumId: string,
    params: PaginationParams,
  ): Promise<{ rows: Apartment[]; total: number }>;
  findByIdAndCondominiumId(
    id: string,
    condominiumId: string,
  ): Promise<Apartment | null>;
  findByNumberAndBlock(
    condominiumId: string,
    number: string,
    block?: string | null,
  ): Promise<Apartment | null>;
  update(apartment: Apartment): Promise<void>;
  delete(id: string): Promise<void>;
}
