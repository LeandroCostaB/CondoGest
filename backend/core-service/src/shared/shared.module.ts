import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { DrizzleService } from "./infra/database/drizzle.service";
import { JwtAuthGuard } from "./infra/guards/jwt-auth.guard";
import { PermissionsGuard } from "./infra/guards/permissions.guard";
import { HateoasInterceptor } from "./infra/hateoas/hateoas.interceptor";
import { JwtStrategy } from "./infra/strategies/jwt.strategy";

@Module({
  providers: [
    DrizzleService,
    JwtStrategy,
    PermissionsGuard,
    { provide: APP_INTERCEPTOR, useClass: HateoasInterceptor },
    // Faz com que o login seja obrigatório em TODO o app
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Verifica as permissões do Enum em cada rota
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [DrizzleService, JwtStrategy],
})
export class SharedModule {}
