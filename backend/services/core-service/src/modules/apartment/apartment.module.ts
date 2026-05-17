import { ApartmentService } from "@apartment/application/services/apartment.service";
import { APARTMENT_REPOSITORY } from "@apartment/domain/repositories/apartment-repository.interface";
import { ApartmentsController } from "@apartment/infra/controllers/apartments.controller";
import { DrizzleApartmentRepository } from "@apartment/infra/repositories/drizzle-apartment.repository";
import { CONDOMINIUM_REPOSITORY } from "@condominium/domain/repositories/condominium-repository.interface";
import { DrizzleCondominiumRepository } from "@condominium/infra/repositories/drizzle-condominium.repository";
import { Module } from "@nestjs/common";
import { SharedModule } from "../../shared/shared.module";
import { MessagingModule } from "@messaging/messaging.module";

@Module({
  imports: [SharedModule, MessagingModule],
  controllers: [ApartmentsController],
  providers: [
    ApartmentService,
    DrizzleApartmentRepository,
    DrizzleCondominiumRepository,
    {
      provide: APARTMENT_REPOSITORY,
      useExisting: DrizzleApartmentRepository,
    },
    {
      provide: CONDOMINIUM_REPOSITORY,
      useExisting: DrizzleCondominiumRepository,
    },
  ],
})
export class ApartmentModule {}
