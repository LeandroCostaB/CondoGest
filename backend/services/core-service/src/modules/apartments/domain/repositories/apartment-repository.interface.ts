import type { Apartment } from "@apartments/domain/models/apartment.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const APARTMENT_REPOSITORY = Symbol("APARTMENT_REPOSITORY");

export interface ApartmentRepository {
  create(apartment: Apartment): Promise<Apartment>;
  findAllByCondominiumIdPaginated(condominiumId: string, params: PaginationParams): Promise<{ rows: Apartment[]; total: number }>;
  findByIdAndCondominiumId(id: string, condominiumId: string): Promise<Apartment | null>;
  findByNumberAndBlock(condominiumId: string, number: string, block?: string | null): Promise<Apartment | null>;
  findByUserId(userId: string): Promise<Apartment | null>;
  update(apartment: Apartment): Promise<void>;
  assignResident(apartmentId: string, userId: string | null): Promise<void>;
  delete(id: string): Promise<void>;
}
