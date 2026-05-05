import { IsString, IsUUID, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateMaintenanceDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsUUID()
    @IsNotEmpty()
    condominiumId!: string;

    @IsUUID()
    @IsOptional()
    apartmentId?: string;
}