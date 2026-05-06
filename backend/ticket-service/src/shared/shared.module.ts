import { Module } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";

// Usando os aliases configurados no tsconfig.json para garantir que os caminhos sejam encontrados
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { JwtAuthGuard } from "@shared/infra/guards/jwt-auth.guard";
import { PermissionsGuard } from "@shared/infra/guards/permissions.guard";
import { HateoasInterceptor } from "@shared/infra/hateoas/hateoas.interceptor";
import { JwtStrategy } from "@shared/infra/strategies/jwt.strategy";

@Module({
  providers: [
    DrizzleService,
    JwtStrategy,
    // Registra o Interceptor Globalmente para HATEOAS (links automáticos nas respostas)
    { 
      provide: APP_INTERCEPTOR, 
      useClass: HateoasInterceptor 
    },
    // Faz com que a autenticação JWT seja obrigatória em TODAS as rotas por padrão
    { 
      provide: APP_GUARD, 
      useClass: JwtAuthGuard 
    },
    // Verifica as permissões (Roles) em cada rota globalmente
    { 
      provide: APP_GUARD, 
      useClass: PermissionsGuard 
    },
  ],
  // Exportamos o DrizzleService e JwtStrategy para que outros módulos (como o Maintenance) possam usá-los
  exports: [DrizzleService, JwtStrategy],
})
export class SharedModule {}