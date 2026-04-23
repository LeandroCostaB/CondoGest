import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";
import { UserModule } from "@user/user.module";

@Module({
  imports: [ConfigModule.forRoot(), UserModule, SharedModule],
})
export class AppModule {}
