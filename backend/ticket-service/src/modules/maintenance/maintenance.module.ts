import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { ProviderModule } from '../provider/provider.module';
import { MaintenanceController } from './infra/controllers/maintenance.controller';
import { MaintenanceService } from './application/services/maintenance.service';
import { MAINTENANCE_REPOSITORY } from './domain/repositories/maintenance-repository.interface';
import { DrizzleMaintenanceRepository } from './infra/repositories/drizzle-maintenance.repository';

@Module({
  imports: [SharedModule, ProviderModule],
  controllers: [MaintenanceController],
  providers: [
    MaintenanceService,
    {
      provide: MAINTENANCE_REPOSITORY,
      useClass: DrizzleMaintenanceRepository,
    },
  ],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
