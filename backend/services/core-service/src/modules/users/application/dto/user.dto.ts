import { ApiProperty } from "@nestjs/swagger";
import type { User, UserRole } from "@users/domain/models/user.entity";

export class UserDto {
  @ApiProperty({ example: "f9714ea4-6c37-434f-87b3-1bacab49002e" })
  id: string | undefined;

  @ApiProperty({ example: "João Silva" })
  nome: string;

  @ApiProperty({ example: "joao@condogest.com" })
  email: string;

  @ApiProperty({ enum: ["SINDICO", "MORADOR"], example: "MORADOR" })
  role: UserRole;

  @ApiProperty({ nullable: true })
  fcmToken: string | null | undefined;

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
  updatedAt: Date | undefined;

  private constructor(user: User) {
    this.id = user.id;
    this.nome = user.nome;
    this.email = user.email;
    this.role = user.role;
    this.fcmToken = user.fcmToken;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static from(user: User | null): UserDto | null {
    if (!user) return null;
    return new UserDto(user);
  }
}
