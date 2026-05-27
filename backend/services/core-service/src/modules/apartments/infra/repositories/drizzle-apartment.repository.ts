import { Apartment } from "@apartments/domain/models/apartment.entity";
import type { ApartmentRepository } from "@apartments/domain/repositories/apartment-repository.interface";
import { apartmentsSchema } from "@apartments/infra/database/schemas/apartment.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { and, asc, eq, isNull, sql } from "drizzle-orm";

@Injectable()
export class DrizzleApartmentRepository implements ApartmentRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(apartment: Apartment): Promise<Apartment> {
    const [row] = await this.drizzleService.db
      .insert(apartmentsSchema)
      .values({
        number: apartment.number,
        block: apartment.block ?? null,
        floor: apartment.floor ?? null,
        condominiumId: apartment.condominiumId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return Apartment.restore(row)!;
  }

  async findAllByCondominiumIdPaginated(
    condominiumId: string,
    params: PaginationParams,
  ): Promise<{ rows: Apartment[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(apartmentsSchema)
        .where(eq(apartmentsSchema.condominiumId, condominiumId))
        .orderBy(asc(apartmentsSchema.block), asc(apartmentsSchema.number))
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(apartmentsSchema)
        .where(eq(apartmentsSchema.condominiumId, condominiumId)),
    ]);

    return {
      rows: rows.map((row) => Apartment.restore(row)!),
      total: countResult.count,
    };
  }

  async findByIdAndCondominiumId(id: string, condominiumId: string): Promise<Apartment | null> {
    const rows = await this.drizzleService.db
      .select()
      .from(apartmentsSchema)
      .where(and(eq(apartmentsSchema.id, id), eq(apartmentsSchema.condominiumId, condominiumId)))
      .limit(1);
    return Apartment.restore(rows[0]);
  }

  async findByNumberAndBlock(
    condominiumId: string,
    number: string,
    block?: string | null,
  ): Promise<Apartment | null> {
    const condition = block
      ? and(
          eq(apartmentsSchema.condominiumId, condominiumId),
          eq(apartmentsSchema.number, number),
          eq(apartmentsSchema.block, block),
        )
      : and(
          eq(apartmentsSchema.condominiumId, condominiumId),
          eq(apartmentsSchema.number, number),
          isNull(apartmentsSchema.block),
        );

    const rows = await this.drizzleService.db
      .select()
      .from(apartmentsSchema)
      .where(condition)
      .limit(1);
    return Apartment.restore(rows[0]);
  }

  async update(apartment: Apartment): Promise<void> {
    await this.drizzleService.db
      .update(apartmentsSchema)
      .set({
        number: apartment.number,
        block: apartment.block ?? null,
        floor: apartment.floor ?? null,
        updatedAt: new Date(),
      })
      .where(eq(apartmentsSchema.id, apartment.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db.delete(apartmentsSchema).where(eq(apartmentsSchema.id, id));
  }
}
