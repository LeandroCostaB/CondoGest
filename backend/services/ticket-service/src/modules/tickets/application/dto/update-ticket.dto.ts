import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { TicketStatus } from "@tickets/domain/models/ticket.entity";

export class UpdateTicketDto {
  @ApiPropertyOptional({ example: "Vazamento na cozinha" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: "Torneira com vazamento constante." })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: "Cozinha" })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ enum: TicketStatus })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
