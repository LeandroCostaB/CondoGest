import { CoreConsumerModule } from "@core-consumer/core-consumer.module";
import { MaintenanceModule } from "@maintenance/maintenance.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";
import { ProvidersModule } from "@providers/providers.module";
import { TicketsModule } from "@tickets/tickets.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    ProvidersModule,
    TicketsModule,
    MaintenanceModule,
    CoreConsumerModule,
  ],
})
export class AppModule {}
