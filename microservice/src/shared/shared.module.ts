import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { DrizzleService } from "./infra/database/drizzle.service";
import { AuthenticationGuard } from "./infra/guards/authentication.guard";
import { PermissionsGuard } from "./infra/guards/permissions.guard";
import { HateoasInterceptor } from "./infra/hateoas/hateoas.interceptor";

@Module({
  providers: [
    DrizzleService,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_INTERCEPTOR, useClass: HateoasInterceptor },
  ],
  exports: [DrizzleService],
})
export class SharedModule {}
