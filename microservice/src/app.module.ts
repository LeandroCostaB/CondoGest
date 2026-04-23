import { CondominiumModule } from "@condominium/condominium.module";
import { UserModule } from "@user/user.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    CondominiumModule,
    SharedModule,
  ],
})
export class AppModule {}
