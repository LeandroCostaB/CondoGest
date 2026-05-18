import type { User, UserRole } from '@user/domain/models/user.entity';

export class UserDto {
  id: string | undefined;
  nome: string;
  email: string;
  role: UserRole;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;

  private constructor(user: User) {
    this.id = user.id;
    this.nome = user.nome;
    this.email = user.email;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static from(user: User | null): UserDto | null {
    if (!user) return null;
    return new UserDto(user);
  }
}
