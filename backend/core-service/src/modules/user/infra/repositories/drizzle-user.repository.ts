import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DrizzleService } from '@shared/infra/database/drizzle.service';
import type { PaginationParams } from '@shared/infra/hateoas';
import { User, type UserRole } from '@user/domain/models/user.entity';
import type { UserRepository } from '@user/domain/repositories/user-repository.interface';
import { users } from '@user/infra/database/schemas/user.schema';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(user: User): Promise<User> {
    const [row] = await this.drizzleService.db
      .insert(users)
      .values({
        nome: user.nome,
        email: user.email,
        senha: user.senha,
        role: user.role,
      })
      .returning();
    return this.toEntity(row);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.drizzleService.db.select().from(users);
    return rows.map((row: typeof users.$inferSelect) => this.toEntity(row));
  }

  async findAllPaginated(params: PaginationParams): Promise<{ rows: User[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db.select().from(users).limit(limit).offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users),
    ]);

    return {
      rows: rows.map((row: typeof users.$inferSelect) => this.toEntity(row)),
      total: countResult.count,
    };
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async update(user: User): Promise<User> {
    const [row] = await this.drizzleService.db
      .update(users)
      .set({
        nome: user.nome,
        email: user.email,
        senha: user.senha,
        role: user.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id!))
      .returning();
    return this.toEntity(row);
  }

  async updateRole(id: string, role: UserRole): Promise<void> {
    await this.drizzleService.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateFcmToken(id: string, token: string): Promise<void> {
    await this.drizzleService.db
      .update(users)
      .set({ fcmToken: token, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db.delete(users).where(eq(users.id, id));
  }

  private toEntity(row: typeof users.$inferSelect): User {
    return User.restore({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      role: row.role as UserRole,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })!;
  }
}
