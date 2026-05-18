import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketStatus } from '../../domain/models/ticket.entity';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
