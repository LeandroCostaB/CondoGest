import { ApartmentModule } from "@apartment/apartment.module";
import { CondominiumModule } from "@condominium/condominium.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";
import { UserModule } from "@user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    CondominiumModule,
    ApartmentModule,
    SharedModule,
  ],
})
export class AppModule {}
