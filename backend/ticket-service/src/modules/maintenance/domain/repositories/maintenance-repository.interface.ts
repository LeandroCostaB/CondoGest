import { Maintenance } from '../models/maintenance.entity';
import { CreateMaintenanceDto } from '../../application/dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../../application/dto/update-maintenance.dto';

export const MAINTENANCE_REPOSITORY = Symbol('MAINTENANCE_REPOSITORY');

export interface IMaintenanceRepository {
    create(data: CreateMaintenanceDto): Promise<Maintenance>;
    findByCondominium(condominiumId: string): Promise<Maintenance[]>;
    update(id: string, data: UpdateMaintenanceDto): Promise<Maintenance | null>;
    delete(id: string): Promise<void>;
}