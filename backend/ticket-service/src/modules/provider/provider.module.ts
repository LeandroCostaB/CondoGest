import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { ProviderController } from './infra/controllers/provider.controller';
import { ProviderService } from './application/services/provider.service';
import { PROVIDER_REPOSITORY } from './domain/repositories/provider-repository.interface';
import { DrizzleProviderRepository } from './infra/repositories/drizzle-provider.repository';

@Module({
  imports: [SharedModule],
  controllers: [ProviderController],
  providers: [
    ProviderService,
    {
      provide: PROVIDER_REPOSITORY,
      useClass: DrizzleProviderRepository,
    },
  ],
  exports: [ProviderService, PROVIDER_REPOSITORY],
})
export class ProviderModule {}
