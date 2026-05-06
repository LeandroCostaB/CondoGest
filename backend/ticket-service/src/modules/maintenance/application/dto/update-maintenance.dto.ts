import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';

export class UpdateMaintenanceDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'])
    @IsOptional()
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

    @IsUUID()
    @IsOptional()
    condominiumId?: string;

    @IsUUID()
    @IsOptional()
    apartmentId?: string;
}