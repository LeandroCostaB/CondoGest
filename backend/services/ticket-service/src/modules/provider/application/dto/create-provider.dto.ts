import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProviderSpecialty } from '../../domain/models/provider.entity';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(ProviderSpecialty)
  specialty: ProviderSpecialty;
}
