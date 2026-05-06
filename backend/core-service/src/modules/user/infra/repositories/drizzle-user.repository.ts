import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { users } from "@user/infra/database/schemas/user.schema";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleUserRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(data: any): Promise<void> {
    await this.drizzleService.db.insert(users).values({
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      role: data.role || 'MORADOR',
    });
  }

  async findAll() {
    return await this.drizzleService.db
      .select()
      .from(users);
  }

  async findById(id: string) {
    const result = await this.drizzleService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  }

  async findAllPaginated(params: PaginationParams) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db.select().from(users).limit(limit).offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users), 
    ]);

    return {
      rows,
      total: countResult.count,
    };
  }

  async updateRole(id: string, role: 'SINDICO' | 'MORADOR'): Promise<void> {
    await this.drizzleService.db
      .update(users)
      .set({ role, updatedAt: sql`now()` }) 
      .where(eq(users.id, id)); 
  }
}