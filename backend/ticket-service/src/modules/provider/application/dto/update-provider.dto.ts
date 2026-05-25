import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProviderSpecialty } from '../../domain/models/provider.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProviderDto {
  @ApiPropertyOptional({ example: 'Encanamentos Rápidos' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '(11) 99999-0001' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: ProviderSpecialty, example: ProviderSpecialty.ELECTRICIAN })
  @IsEnum(ProviderSpecialty)
  @IsOptional()
  specialty?: ProviderSpecialty;
}
