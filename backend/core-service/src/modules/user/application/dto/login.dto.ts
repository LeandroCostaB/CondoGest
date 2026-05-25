import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Forneça um e-mail válido.' })
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    senha!: string;
}