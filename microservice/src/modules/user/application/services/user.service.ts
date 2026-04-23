import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '@user/infra/database/database.config';
import { users } from '@user/infra/database/schemas/user.schema';

@Injectable()
export class UserService {
  
  async findAll() {
    return await db.select({
      id: users.id,
      nome: users.nome,
      email: users.email,
      role: users.role,
    }).from(users);
  }

  async update(id: string, data: any) {
    if (data.senha) {
      const salt = await bcrypt.genSalt(10);
      data.senha = await bcrypt.hash(data.senha, salt);
    }

    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) throw new NotFoundException('Usuário não encontrado');

    const { senha, ...result } = updatedUser;
    return result;
  }

  async delete(id: string) {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    if (!deletedUser) throw new NotFoundException('Usuário não encontrado');

    return { message: 'Usuário removido com sucesso' };
  }
}