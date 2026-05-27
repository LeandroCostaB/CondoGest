import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  CondogestTicketExchangeName,
  CondogestTicketRoutingKey,
} from "@shared/contracts/events/condogest-ticket-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import type { MaintenanceDto } from "@maintenance/application/dto/maintenance.dto";

@Injectable()
export class MaintenanceMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MaintenanceMessagingService.name);

  constructor(private readonly sharedMessagingService: SharedMessagingService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.sharedMessagingService.assertExchange(CondogestTicketExchangeName.MAINTENANCE_COMPLETED);
    } catch (error) {
      this.logger.error("Failed to assert maintenance exchanges", error);
      throw error;
    }
  }

  async publishMaintenanceCompleted(maintenance: MaintenanceDto): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestTicketExchangeName.MAINTENANCE_COMPLETED,
      CondogestTicketRoutingKey.MAINTENANCE_COMPLETED,
      maintenance,
    );
  }
}
