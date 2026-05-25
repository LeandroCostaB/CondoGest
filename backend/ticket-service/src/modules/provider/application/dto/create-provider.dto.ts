import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ProviderSpecialty } from '../../domain/models/provider.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({ example: 'Encanamentos Total' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '(11) 98888-0001' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: ProviderSpecialty, example: ProviderSpecialty.PLUMBER })
  @IsEnum(ProviderSpecialty)
  specialty: ProviderSpecialty;
}
