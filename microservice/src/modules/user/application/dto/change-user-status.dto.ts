import { UserStatus } from "@user/domain/models/user.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";

export class ChangeUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}
