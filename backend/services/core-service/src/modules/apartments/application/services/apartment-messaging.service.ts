import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  CondogestCoreExchangeName,
  CondogestCoreRoutingKey,
} from "@shared/contracts/events/condogest-core-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import type { ApartmentDto } from "@apartments/application/dto/apartment.dto";

@Injectable()
export class ApartmentMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ApartmentMessagingService.name);

  constructor(private readonly sharedMessagingService: SharedMessagingService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.APARTMENT_CREATED),
        this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.APARTMENT_UPDATED),
        this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.APARTMENT_DELETED),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert apartment exchanges", error);
      throw error;
    }
  }

  async publishApartmentCreated(apartment: ApartmentDto): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestCoreExchangeName.APARTMENT_CREATED,
      CondogestCoreRoutingKey.APARTMENT_CREATED,
      apartment,
    );
  }

  async publishApartmentUpdated(apartment: ApartmentDto): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestCoreExchangeName.APARTMENT_UPDATED,
      CondogestCoreRoutingKey.APARTMENT_UPDATED,
      apartment,
    );
  }

  async publishApartmentDeleted(id: string): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestCoreExchangeName.APARTMENT_DELETED,
      CondogestCoreRoutingKey.APARTMENT_DELETED,
      { id },
    );
  }
}
