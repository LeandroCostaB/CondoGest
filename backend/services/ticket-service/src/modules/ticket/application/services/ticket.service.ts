import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../../domain/repositories/ticket-repository.interface';
import { Ticket, TicketStatus } from '../../domain/models/ticket.entity';
import { TicketDto } from '../dto/ticket.dto';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { MessagingService } from '../../../messaging/application/services/messaging.service';
import {
  TICKET_EXCHANGE,
  TICKET_CREATED_KEY,
  TICKET_STATUS_CHANGED_KEY,
} from '@shared/contracts/events/messaging.constants';

@Injectable()
export class TicketService {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    private readonly messagingService: MessagingService,
  ) {}

  async create(dto: CreateTicketDto): Promise<TicketDto> {
    const ticket = Ticket.restore({
      title: dto.title,
      description: dto.description,
      location: dto.location,
      status: TicketStatus.OPEN,
      residentId: dto.residentId,
      apartmentId: dto.apartmentId,
    });

    const created = await this.ticketRepository.create(ticket!);

    await this.messagingService.publish(TICKET_EXCHANGE, TICKET_CREATED_KEY, {
      ticketId: created.id,
      residentId: created.residentId,
      apartmentId: created.apartmentId,
      title: created.title,
      location: created.location,
      status: created.status,
      createdAt: created.createdAt?.toISOString(),
    });

    return TicketDto.from(created)!;
  }

  async findAll(): Promise<TicketDto[]> {
    const tickets = await this.ticketRepository.findAll();
    return tickets.map((t) => TicketDto.from(t)!);
  }

  async findById(id: string): Promise<TicketDto> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    return TicketDto.from(ticket)!;
  }

  async findByResidentId(residentId: string): Promise<TicketDto[]> {
    const tickets = await this.ticketRepository.findByResidentId(residentId);
    return tickets.map((t) => TicketDto.from(t)!);
  }

  async findByApartmentId(apartmentId: string): Promise<TicketDto[]> {
    const tickets = await this.ticketRepository.findByApartmentId(apartmentId);
    return tickets.map((t) => TicketDto.from(t)!);
  }

  async update(id: string, dto: UpdateTicketDto): Promise<void> {
    if (!dto.title && !dto.description && !dto.location && !dto.status) {
      throw new BadRequestException('Ao menos um campo deve ser informado para atualização');
    }

    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket não encontrado');

    const oldStatus = ticket.status;

    if (dto.title) ticket.withTitle(dto.title);
    if (dto.description) ticket.withDescription(dto.description);
    if (dto.location) ticket.withLocation(dto.location);
    if (dto.status) ticket.withStatus(dto.status);

    await this.ticketRepository.update(ticket);

    if (dto.status && dto.status !== oldStatus) {
      await this.messagingService.publish(TICKET_EXCHANGE, TICKET_STATUS_CHANGED_KEY, {
        ticketId: ticket.id,
        residentId: ticket.residentId,
        oldStatus,
        newStatus: ticket.status,
        changedAt: new Date().toISOString(),
      });
    }
  }

  async delete(id: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) throw new NotFoundException('Ticket não encontrado');
    await this.ticketRepository.delete(id);
  }
}
