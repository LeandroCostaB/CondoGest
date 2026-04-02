import { UserService } from "@user/application/services/user.service";
import { USER_REPOSITORY } from "@user/domain/repositories/user-repository.interface";
import { UsersController } from "@user/infra/controllers/users.controller";
import { DrizzleUserRepository } from "@user/infra/repositories/drizzle-user.repository";
import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";

@Module({
  imports: [SharedModule],
  controllers: [UsersController],
  providers: [
    UserService,
    DrizzleUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: DrizzleUserRepository,
    },
  ],
})
export class UserModule {}
