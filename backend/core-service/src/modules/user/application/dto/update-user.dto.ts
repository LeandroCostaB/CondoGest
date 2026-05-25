import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'João Silva Atualizado' })
    @IsString()
    @IsOptional()
    nome?: string;

    @ApiPropertyOptional({ example: 'joao.novo@condogest.com' })
    @IsEmail({}, { message: 'Forneça um e-mail válido.' })
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: 'novaSenha123', minLength: 6 })
    @IsString()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    @IsOptional()
    senha?: string;
}
