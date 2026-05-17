import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum RoleEnum {
  SINDICO = 'SINDICO',
  MORADOR = 'MORADOR',
}

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  nome!: string;

  @ApiProperty({ example: 'joao@condogest.com' })
  @IsEmail({}, { message: 'Forneça um e-mail válido.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  senha!: string;

  @ApiPropertyOptional({ enum: RoleEnum, default: RoleEnum.MORADOR })
  @IsEnum(RoleEnum, { message: 'O papel deve ser SINDICO ou MORADOR.' })
  @IsOptional()
  role?: RoleEnum;
}
