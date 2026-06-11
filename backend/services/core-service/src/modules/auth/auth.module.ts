import { AuthService } from "@auth/application/services/auth.service";
import { AuthController } from "@auth/infra/controllers/auth.controller";
import { ApartmentsModule } from "@apartments/apartments.module";
import { Module } from "@nestjs/common";
import { UsersModule } from "@users/users.module";

@Module({
  imports: [UsersModule, ApartmentsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
