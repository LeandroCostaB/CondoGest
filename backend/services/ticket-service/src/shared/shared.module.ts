import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { DrizzleService } from '@shared/infra/database/drizzle.service';
import { JwtAuthGuard } from '@shared/infra/auth/jwt-auth.guard';
import { PermissionsGuard } from '@shared/infra/auth/permissions.guard';
import { HateoasInterceptor } from '@shared/infra/hateoas/hateoas.interceptor';
import { JwtStrategy } from '@shared/infra/strategies/jwt.strategy';

@Module({
  imports: [PassportModule],
  providers: [
    DrizzleService,
    JwtStrategy,
    { provide: APP_INTERCEPTOR, useClass: HateoasInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [DrizzleService, JwtStrategy],
})
export class SharedModule {}