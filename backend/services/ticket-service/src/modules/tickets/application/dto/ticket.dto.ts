import { ApiProperty } from "@nestjs/swagger";
import type { Ticket, TicketStatus } from "@tickets/domain/models/ticket.entity";

export class TicketDto {
  @ApiProperty()
  id: string | undefined;

  @ApiProperty({ example: "Vazamento na cozinha" })
  title: string;

  @ApiProperty({ example: "Torneira com vazamento constante." })
  description: string;

  @ApiProperty({ example: "Cozinha" })
  location: string;

  @ApiProperty({ enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELED"] })
  status: TicketStatus;

  @ApiProperty()
  residentId: string;

  @ApiProperty()
  apartmentId: string;

  @ApiProperty()
  createdAt: Date | undefined;

  @ApiProperty()
  updatedAt: Date | undefined;

  private constructor(t: Ticket) {
    this.id = t.id;
    this.title = t.title;
    this.description = t.description;
    this.location = t.location;
    this.status = t.status;
    this.residentId = t.residentId;
    this.apartmentId = t.apartmentId;
    this.createdAt = t.createdAt;
    this.updatedAt = t.updatedAt;
  }

  static from(t: Ticket | null): TicketDto | null {
    if (!t) return null;
    return new TicketDto(t);
  }
}
