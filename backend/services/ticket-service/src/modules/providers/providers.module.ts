import { Module } from "@nestjs/common";
import { PROVIDER_REPOSITORY } from "@providers/domain/repositories/provider-repository.interface";
import { DrizzleProviderRepository } from "@providers/infra/repositories/drizzle-provider.repository";
import { ProviderService } from "@providers/application/services/provider.service";
import { ProviderController } from "@providers/infra/controllers/provider.controller";

@Module({
  providers: [
    DrizzleProviderRepository,
    { provide: PROVIDER_REPOSITORY, useClass: DrizzleProviderRepository },
    ProviderService,
  ],
  controllers: [ProviderController],
  exports: [DrizzleProviderRepository, PROVIDER_REPOSITORY],
})
export class ProvidersModule {}
