import { Injectable } from '@nestjs/common';
import { DrizzleService } from '@shared/infra/database/drizzle.service';
import { IMaintenanceRepository } from '../../domain/repositories/maintenance-repository.interface';
import { CreateMaintenanceDto } from '../../application/dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../../application/dto/update-maintenance.dto';
import { Maintenance } from '../../domain/models/maintenance.entity';
import { maintenance } from '../database/schemas/maintenance.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class DrizzleMaintenanceRepository implements IMaintenanceRepository {
    constructor(private readonly drizzle: DrizzleService) { }

    async create(data: CreateMaintenanceDto): Promise<Maintenance> {
        const [result] = await this.drizzle.db
            .insert(maintenance)
            .values(data)
            .returning();
        return new Maintenance(result as any);
    }

    async findByCondominium(condominiumId: string): Promise<Maintenance[]> {
        const results = await this.drizzle.db
            .select()
            .from(maintenance)
            .where(eq(maintenance.condominiumId, condominiumId));
        return results.map((row: any) => new Maintenance(row));
    }

    // Implementação do Update
    async update(id: string, data: UpdateMaintenanceDto): Promise<Maintenance | null> {
        const [result] = await this.drizzle.db
            .update(maintenance)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(maintenance.id, id))
            .returning();

        return result ? new Maintenance(result as any) : null;
    }

    // Implementação do Delete
    async delete(id: string): Promise<void> {
        await this.drizzle.db
            .delete(maintenance)
            .where(eq(maintenance.id, id));
    }
}