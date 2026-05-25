import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SharedModule } from '../../shared/shared.module';

import { MaintenanceController } from './infra/controllers/maintenance.controller';
import { MaintenanceService } from './application/services/maintenance.service';
import { MAINTENANCE_REPOSITORY } from './domain/repositories/maintenance-repository.interface';
import { DrizzleMaintenanceRepository } from './infra/repositories/drizzle-maintenance.repository';

@Module({
    imports: [
        SharedModule,
        // Configuração do RabbitMQ integrada corretamente no array de imports
        ClientsModule.register([
            {
                name: 'NOTIFICATION_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                    queue: 'notification.queue',
                },
            },
        ]),
    ],
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
export class MaintenanceModule { }