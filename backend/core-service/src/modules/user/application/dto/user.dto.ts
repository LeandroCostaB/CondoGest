import { type User, UserType } from "@user/domain/models/user.entity";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsEnum(UserType)
  @IsOptional()
  type?: UserType;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(UserType)
  @IsOptional()
  type?: UserType;
}

export class UserResponseDto {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public type: UserType,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static from(user: User | null): UserResponseDto | null {
    if (!user) return null;
    return new UserResponseDto(
      user.id!,
      user.name,
      user.email,
      user.type,
      user.createdAt,
      user.updatedAt,
    );
  }
}
