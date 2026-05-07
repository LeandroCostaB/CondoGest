import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { ProviderModule } from './modules/provider/provider.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { TicketModule } from './modules/ticket/ticket.module';

@Module({
  imports: [
    SharedModule,
    ProviderModule,
    MaintenanceModule,
    TicketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
