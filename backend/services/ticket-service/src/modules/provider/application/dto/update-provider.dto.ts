import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProviderSpecialty } from '../../domain/models/provider.entity';

export class UpdateProviderDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(ProviderSpecialty)
  @IsOptional()
  specialty?: ProviderSpecialty;
}
