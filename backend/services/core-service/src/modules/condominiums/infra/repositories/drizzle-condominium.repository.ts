import {
  Condominium,
  CondominiumStatus,
} from "@condominiums/domain/models/condominium.entity";
import type { CondominiumRepository } from "@condominiums/domain/repositories/condominium-repository.interface";
import { condominiumsSchema } from "@condominiums/infra/database/schemas/condominium.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { desc, eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleCondominiumRepository implements CondominiumRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(condominium: Condominium): Promise<Condominium> {
    const [row] = await this.drizzleService.db
      .insert(condominiumsSchema)
      .values({
        name: condominium.name,
        address: condominium.address,
        userId: condominium.userId,
        status: condominium.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return Condominium.restore({ ...row, status: row.status as CondominiumStatus })!;
  }

  async findAllByUserId(userId: string): Promise<Condominium[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(condominiumsSchema)
      .where(eq(condominiumsSchema.userId, userId))
      .orderBy(desc(condominiumsSchema.createdAt));
    return rows.map((row) => Condominium.restore({ ...row, status: row.status as CondominiumStatus })!);
  }

  async findAllByUserIdPaginated(
    userId: string,
    params: PaginationParams,
  ): Promise<{ rows: Condominium[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(condominiumsSchema)
        .where(eq(condominiumsSchema.userId, userId))
        .orderBy(desc(condominiumsSchema.createdAt))
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(condominiumsSchema)
        .where(eq(condominiumsSchema.userId, userId)),
    ]);

    return {
      rows: rows.map((row) => Condominium.restore({ ...row, status: row.status as CondominiumStatus })!),
      total: countResult.count,
    };
  }

  async findById(id: string): Promise<Condominium | null> {
    const result = await this.drizzleService.db
      .select()
      .from(condominiumsSchema)
      .where(eq(condominiumsSchema.id, id))
      .limit(1);
    if (!result[0]) return null;
    return Condominium.restore({ ...result[0], status: result[0].status as CondominiumStatus });
  }

  async update(condominium: Condominium): Promise<void> {
    await this.drizzleService.db
      .update(condominiumsSchema)
      .set({ name: condominium.name, address: condominium.address, updatedAt: new Date() })
      .where(eq(condominiumsSchema.id, condominium.id!));
  }

  async updateStatus(id: string, status: CondominiumStatus): Promise<void> {
    await this.drizzleService.db
      .update(condominiumsSchema)
      .set({ status, updatedAt: new Date() })
      .where(eq(condominiumsSchema.id, id));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db.delete(condominiumsSchema).where(eq(condominiumsSchema.id, id));
  }
}
