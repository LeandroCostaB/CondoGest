import { CondominiumService } from "@condominium/application/services/condominium.service";
import { CONDOMINIUM_REPOSITORY } from "@condominium/domain/repositories/condominium-repository.interface";
import { CondominiumsController } from "@condominium/infra/controllers/condominiums.controller";
import { DrizzleCondominiumRepository } from "@condominium/infra/repositories/drizzle-condominium.repository";
import { Module } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { MessagingModule } from "@messaging/messaging.module";

@Module({
  imports: [SharedModule, MessagingModule],
  controllers: [CondominiumsController],
  providers: [
    CondominiumService,
    DrizzleCondominiumRepository,
    {
      provide: CONDOMINIUM_REPOSITORY,
      useExisting: DrizzleCondominiumRepository,
    },
  ],
})
export class CondominiumModule {}