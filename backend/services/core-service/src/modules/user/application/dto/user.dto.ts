import { ApiProperty } from '@nestjs/swagger';
import type { User, UserRole } from '@user/domain/models/user.entity';

export class UserDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string | undefined;

  @ApiProperty({ example: 'João Silva' })
  nome: string;

  @ApiProperty({ example: 'joao@condogest.com' })
  email: string;

  @ApiProperty({ enum: ['SINDICO', 'MORADOR'], example: 'MORADOR' })
  role: UserRole;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date | undefined;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
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
