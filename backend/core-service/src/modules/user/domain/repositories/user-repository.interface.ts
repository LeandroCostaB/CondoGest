import type {
  User,
  UserStatus,
} from "@user/domain/models/user.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const USER_REPOSITORY = Symbol("USER_REPOSITORY");

export interface UserRepository {
  create(user: User): Promise<void>;
  findAll(): Promise<User[]>;
  findAllPaginated(params: PaginationParams): Promise<{ rows: User[]; total: number }>;
  findById(id: string): Promise<User | null>;
  updateStatus(id: string, status: UserStatus): Promise<void>;
}
