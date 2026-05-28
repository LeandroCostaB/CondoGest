import { ApartmentsModule } from "@apartments/apartments.module";
import { AuthModule } from "@auth/auth.module";
import { CondominiumsModule } from "@condominiums/condominiums.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";
import { UsersModule } from "@users/users.module";
import { SeedModule } from "./seed/seed.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    UsersModule,
    AuthModule,
    CondominiumsModule,
    ApartmentsModule,
    SeedModule,
  ],
})
export class AppModule {}
