import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  CondogestCoreExchangeName,
  CondogestCoreRoutingKey,
} from "@shared/contracts/events/condogest-core-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";
import type { UserDto } from "@users/application/dto/user.dto";

@Injectable()
export class UserMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserMessagingService.name);

  constructor(private readonly sharedMessagingService: SharedMessagingService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.USER_CREATED),
        this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.USER_UPDATED),
        this.sharedMessagingService.assertExchange(CondogestCoreExchangeName.USER_DELETED),
      ]);
    } catch (error) {
      this.logger.error("Failed to assert user exchanges", error);
      throw error;
    }
  }

  async publishUserCreated(user: UserDto): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestCoreExchangeName.USER_CREATED,
      CondogestCoreRoutingKey.USER_CREATED,
      user,
    );
  }

  async publishUserUpdated(user: UserDto): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestCoreExchangeName.USER_UPDATED,
      CondogestCoreRoutingKey.USER_UPDATED,
      user,
    );
  }

  async publishUserDeleted(userId: string): Promise<void> {
    await this.sharedMessagingService.publish(
      CondogestCoreExchangeName.USER_DELETED,
      CondogestCoreRoutingKey.USER_DELETED,
      { id: userId },
    );
  }
}
