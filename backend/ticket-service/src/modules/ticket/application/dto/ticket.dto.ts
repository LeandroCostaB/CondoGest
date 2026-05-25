import type { Ticket } from '../../domain/models/ticket.entity';
import { TicketStatus } from '../../domain/models/ticket.entity';
import { ApiProperty } from '@nestjs/swagger';

export class TicketDto {
  @ApiProperty({ example: 'b8c9d0e1-f2a3-4567-1234-567890123456' })
  id: string | undefined;

  @ApiProperty({ example: 'Vazamento na cozinha' })
  title: string;

  @ApiProperty({ example: 'Torneira com vazamento constante, água escorrendo pelo armário.' })
  description: string;

  @ApiProperty({ example: 'Cozinha' })
  location: string;

  @ApiProperty({ enum: TicketStatus, example: TicketStatus.OPEN })
  status: TicketStatus;

  @ApiProperty({ example: '24b8e62f-4c7a-4481-b07c-329664c9e194' })
  residentId: string;

  @ApiProperty({ example: 'a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce' })
  apartmentId: string;

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
  updatedAt: Date | undefined;

  private constructor(ticket: Ticket) {
    this.id = ticket.id;
    this.title = ticket.title;
    this.description = ticket.description;
    this.location = ticket.location;
    this.status = ticket.status;
    this.residentId = ticket.residentId;
    this.apartmentId = ticket.apartmentId;
    this.createdAt = ticket.createdAt;
    this.updatedAt = ticket.updatedAt;
  }

  static from(ticket: Ticket | null): TicketDto | null {
    if (!ticket) return null;
    return new TicketDto(ticket);
  }
}
