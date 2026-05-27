import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { Provider, ProviderSpecialty } from "@providers/domain/models/provider.entity";
import type { ProviderRepository } from "@providers/domain/repositories/provider-repository.interface";
import { providersSchema } from "@providers/infra/database/schemas/provider.schema";

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
      })
      .returning();
    return Provider.restore({ ...row, specialty: row.specialty as ProviderSpecialty })!;
  }

  async findAll(): Promise<Provider[]> {
    const rows = await this.drizzle.db.select().from(providersSchema);
    return rows.map((r) => Provider.restore({ ...r, specialty: r.specialty as ProviderSpecialty })!);
  }

  async findById(id: string): Promise<Provider | null> {
    const [row] = await this.drizzle.db
      .select()
      .from(providersSchema)
      .where(eq(providersSchema.id, id));
    if (!row) return null;
    return Provider.restore({ ...row, specialty: row.specialty as ProviderSpecialty })!;
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
    await this.drizzle.db.delete(providersSchema).where(eq(providersSchema.id, id));
  }
}
