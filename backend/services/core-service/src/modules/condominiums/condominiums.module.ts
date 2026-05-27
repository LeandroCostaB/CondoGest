import { CondominiumMessagingService } from "@condominiums/application/services/condominium-messaging.service";
import { CondominiumService } from "@condominiums/application/services/condominium.service";
import { CONDOMINIUM_REPOSITORY } from "@condominiums/domain/repositories/condominium-repository.interface";
import { CondominiumsController } from "@condominiums/infra/controllers/condominiums.controller";
import { DrizzleCondominiumRepository } from "@condominiums/infra/repositories/drizzle-condominium.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [CondominiumsController],
  providers: [
    CondominiumService,
    CondominiumMessagingService,
    DrizzleCondominiumRepository,
    { provide: CONDOMINIUM_REPOSITORY, useExisting: DrizzleCondominiumRepository },
  ],
  exports: [DrizzleCondominiumRepository, CONDOMINIUM_REPOSITORY],
})
export class CondominiumsModule {}
