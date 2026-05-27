import { Module } from "@nestjs/common";
import { ProvidersModule } from "@providers/providers.module";
import { MAINTENANCE_REPOSITORY } from "@maintenance/domain/repositories/maintenance-repository.interface";
import { DrizzleMaintenanceRepository } from "@maintenance/infra/repositories/drizzle-maintenance.repository";
import { MaintenanceMessagingService } from "@maintenance/application/services/maintenance-messaging.service";
import { MaintenanceService } from "@maintenance/application/services/maintenance.service";
import { MaintenanceController } from "@maintenance/infra/controllers/maintenance.controller";

@Module({
  imports: [ProvidersModule],
  providers: [
    DrizzleMaintenanceRepository,
    { provide: MAINTENANCE_REPOSITORY, useClass: DrizzleMaintenanceRepository },
    MaintenanceMessagingService,
    MaintenanceService,
  ],
  controllers: [MaintenanceController],
})
export class MaintenanceModule {}
