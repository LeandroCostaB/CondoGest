import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';

@Module({
    imports: [
        SharedModule,
        MaintenanceModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }