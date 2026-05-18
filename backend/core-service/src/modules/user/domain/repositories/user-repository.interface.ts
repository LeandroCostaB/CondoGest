import type { User, UserRole } from '@user/domain/models/user.entity';
import type { PaginationParams } from '@shared/infra/hateoas';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  create(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findAllPaginated(params: PaginationParams): Promise<{ rows: User[]; total: number }>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<User>;
  updateRole(id: string, role: UserRole): Promise<void>;
  delete(id: string): Promise<void>;
}
