import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { User, type UserRole } from "@users/domain/models/user.entity";
import type { UserRepository } from "@users/domain/repositories/user-repository.interface";
import { usersSchema } from "@users/infra/database/schemas/user.schema";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(user: User): Promise<User> {
    const [row] = await this.drizzleService.db
      .insert(usersSchema)
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
    const rows = await this.drizzleService.db.select().from(usersSchema);
    return rows.map((row) => this.toEntity(row));
  }

  async findAllPaginated(params: PaginationParams): Promise<{ rows: User[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db.select().from(usersSchema).limit(limit).offset(offset),
      this.drizzleService.db.select({ count: sql<number>`count(*)::int` }).from(usersSchema),
    ]);

    return {
      rows: rows.map((row) => this.toEntity(row)),
      total: countResult.count,
    };
  }

  async findById(id: string): Promise<User | null> {
    const rows = await this.drizzleService.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.id, id))
      .limit(1);
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await this.drizzleService.db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, email.toLowerCase()))
      .limit(1);
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async update(user: User): Promise<User> {
    const [row] = await this.drizzleService.db
      .update(usersSchema)
      .set({
        nome: user.nome,
        email: user.email,
        senha: user.senha,
        role: user.role,
        updatedAt: new Date(),
      })
      .where(eq(usersSchema.id, user.id!))
      .returning();
    return this.toEntity(row);
  }

  async updateFcmToken(id: string, token: string): Promise<void> {
    await this.drizzleService.db
      .update(usersSchema)
      .set({ fcmToken: token, updatedAt: new Date() })
      .where(eq(usersSchema.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db.delete(usersSchema).where(eq(usersSchema.id, id));
  }

  private toEntity(row: typeof usersSchema.$inferSelect): User {
    return User.restore({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senha: row.senha,
      role: row.role as UserRole,
      fcmToken: row.fcmToken,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })!;
  }
}
