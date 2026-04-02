import type { User } from "@user/domain/models/user.entity";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
  @ApiProperty({ example: "uuid" })
  id: string | undefined;
  
  @ApiProperty({ example: "2024-03-01" })
  startDate: Date;

  @ApiProperty({ example: "2024-07-01" })
  endDate: Date;

  @ApiProperty({ example: "active" })
  status: string;

  private constructor(
    id: string | undefined,
    startDate: Date,
    endDate: Date,
    status: string,
  ) {
    this.id = id;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = status;
  }

  public static from(user: User | null): UserDto | null {
    if (!user) return null;
    return new UserDto(
      user.id,
      user.startDate,
      user.endDate,
      user.status,
    );
  }
}
