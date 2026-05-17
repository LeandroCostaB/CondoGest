import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '@shared/infra/database/drizzle.service';
import { Provider, ProviderSpecialty } from '../../domain/models/provider.entity';
import type { ProviderRepository } from '../../domain/repositories/provider-repository.interface';
import { providersSchema } from '../database/schemas/provider.schema';

@Injectable()
export class DrizzleProviderRepository implements ProviderRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async create(provider: Provider): Promise<Provider> {
    const [row] = await this.drizzle.db
      .insert(providersSchema)
      .values({
        name: provider.name,
        phone: provider.phone,
        specialty: provider.specialty,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return this.toEntity(row);
  }

  async findAll(): Promise<Provider[]> {
    const rows = await this.drizzle.db.select().from(providersSchema);
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<Provider | null> {
    const rows = await this.drizzle.db
      .select()
      .from(providersSchema)
      .where(eq(providersSchema.id, id))
      .limit(1);
    return rows[0] ? this.toEntity(rows[0]) : null;
  }

  async update(provider: Provider): Promise<void> {
    await this.drizzle.db
      .update(providersSchema)
      .set({
        name: provider.name,
        phone: provider.phone,
        specialty: provider.specialty,
        updatedAt: new Date(),
      })
      .where(eq(providersSchema.id, provider.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db
      .delete(providersSchema)
      .where(eq(providersSchema.id, id));
  }

  private toEntity(row: typeof providersSchema.$inferSelect): Provider {
    return Provider.restore({
      id: row.id,
      name: row.name,
      phone: row.phone,
      specialty: row.specialty as ProviderSpecialty,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })!;
  }
}
