import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IMaintenanceRepository, MAINTENANCE_REPOSITORY } from '../../domain/repositories/maintenance-repository.interface';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../dto/update-maintenance.dto';
import { Maintenance } from '../../domain/models/maintenance.entity';

@Injectable()
export class MaintenanceService {
    constructor(
        @Inject(MAINTENANCE_REPOSITORY)
        private readonly maintenanceRepository: IMaintenanceRepository,
    ) { }

    async create(dto: CreateMaintenanceDto): Promise<Maintenance> {
        return this.maintenanceRepository.create(dto);
    }

    async getByCondominium(condominiumId: string): Promise<Maintenance[]> {
        return this.maintenanceRepository.findByCondominium(condominiumId);
    }
    
    async update(id: string, dto: UpdateMaintenanceDto): Promise<Maintenance> {
        const updated = await this.maintenanceRepository.update(id, dto);
        if (!updated) {
            throw new NotFoundException('Manutenção não encontrada');
        }
        return updated;
    }

    async delete(id: string): Promise<void> {
        await this.maintenanceRepository.delete(id);
    }
}