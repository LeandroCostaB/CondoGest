import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
    @ApiProperty({ example: 'fcm-device-token-abc123' })
    @IsString()
    @IsNotEmpty()
    token!: string;
}