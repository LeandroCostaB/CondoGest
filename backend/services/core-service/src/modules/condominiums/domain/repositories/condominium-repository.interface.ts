import type { Condominium, CondominiumStatus } from "@condominiums/domain/models/condominium.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const CONDOMINIUM_REPOSITORY = Symbol("CONDOMINIUM_REPOSITORY");

export interface CondominiumRepository {
  create(condominium: Condominium): Promise<Condominium>;
  findAllByUserId(userId: string): Promise<Condominium[]>;
  findAllByUserIdPaginated(userId: string, params: PaginationParams): Promise<{ rows: Condominium[]; total: number }>;
  findById(id: string): Promise<Condominium | null>;
  update(condominium: Condominium): Promise<void>;
  updateStatus(id: string, status: CondominiumStatus): Promise<void>;
  delete(id: string): Promise<void>;
}
