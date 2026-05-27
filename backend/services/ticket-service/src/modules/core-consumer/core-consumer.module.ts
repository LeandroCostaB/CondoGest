import { Module } from "@nestjs/common";
import { CoreEventConsumerService } from "@core-consumer/application/services/core-event-consumer.service";

@Module({
  providers: [CoreEventConsumerService],
})
export class CoreConsumerModule {}
