import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  CondogestCoreExchangeName,
  CondogestCoreRoutingKey,
} from "@shared/contracts/events/condogest-core-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import type { CondominiumDto } from "@condominiums/application/dto/condominium.dto";

@Injectable()
export class CondominiumMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CondominiumMessagingService.name);

  constructor(private readonly sharedMessagingService: SharedMessagingService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.CONDOMINIUM_CREATED),
        this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.CONDOMINIUM_UPDATED),
        this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.CONDOMINIUM_DELETED),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert condominium exchanges", error);
      throw error;
    }
  }

  async publishCondominiumCreated(condominium: CondominiumDto): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestCoreExchangeName.CONDOMINIUM_CREATED,
      CondogestCoreRoutingKey.CONDOMINIUM_CREATED,
      condominium,
    );
  }

  async publishCondominiumUpdated(condominium: CondominiumDto): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestCoreExchangeName.CONDOMINIUM_UPDATED,
      CondogestCoreRoutingKey.CONDOMINIUM_UPDATED,
      condominium,
    );
  }

  async publishCondominiumDeleted(id: string): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestCoreExchangeName.CONDOMINIUM_DELETED,
      CondogestCoreRoutingKey.CONDOMINIUM_DELETED,
      { id },
    );
  }
}
