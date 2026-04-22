import { UserModule } from "@user/user.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    SharedModule,
  ],
})
export class AppModule {}
