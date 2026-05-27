import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { ProviderSpecialty } from "@providers/domain/models/provider.entity";

export class UpdateProviderDto {
  @ApiPropertyOptional({ example: "Encanamentos Total" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: "(11) 98888-0001" })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: ProviderSpecialty })
  @IsEnum(ProviderSpecialty)
  @IsOptional()
  specialty?: ProviderSpecialty;
}
