import { ApartmentMessagingService } from "@apartments/application/services/apartment-messaging.service";
import { ApartmentService } from "@apartments/application/services/apartment.service";
import { APARTMENT_REPOSITORY } from "@apartments/domain/repositories/apartment-repository.interface";
import { ApartmentsController } from "@apartments/infra/controllers/apartments.controller";
import { DrizzleApartmentRepository } from "@apartments/infra/repositories/drizzle-apartment.repository";
import { Module } from "@nestjs/common";
import { CondominiumsModule } from "@condominiums/condominiums.module";

@Module({
  imports: [CondominiumsModule],
  controllers: [ApartmentsController],
  providers: [
    ApartmentService,
    ApartmentMessagingService,
    DrizzleApartmentRepository,
    { provide: APARTMENT_REPOSITORY, useExisting: DrizzleApartmentRepository },
  ],
})
export class ApartmentsModule {}
