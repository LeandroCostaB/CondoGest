import { ApartmentModule } from "@apartment/apartment.module";
import { CondominiumModule } from "@condominium/condominium.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";
import { UserModule } from "@user/user.module";
import { MessagingModule } from "@messaging/messaging.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    SharedModule,
    MessagingModule,
    UserModule,
    CondominiumModule,
    ApartmentModule,
  ],
})
export class AppModule {}
