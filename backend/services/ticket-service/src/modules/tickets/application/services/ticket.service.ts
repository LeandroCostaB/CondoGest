import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { TICKET_REPOSITORY, type TicketRepository } from "@tickets/domain/repositories/ticket-repository.interface";
import { Ticket, TicketStatus } from "@tickets/domain/models/ticket.entity";
import { TicketDto } from "@tickets/application/dto/ticket.dto";
import type { CreateTicketDto } from "@tickets/application/dto/create-ticket.dto";
import type { UpdateTicketDto } from "@tickets/application/dto/update-ticket.dto";
import { TicketMessagingService } from "@tickets/application/services/ticket-messaging.service";
import type { PaginatedResult } from "@shared/infra/hateoas";

@Injectable()
export class TicketService {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: TicketRepository,
    private readonly ticketMessagingService: TicketMessagingService,
  ) {}

  async create(dto: CreateTicketDto, residentId: string): Promise<TicketDto> {
    const ticket = Ticket.restore({
      title: dto.title,
      description: dto.description,
      location: dto.location,
      status: TicketStatus.OPEN,
      residentId,
      apartmentId: dto.apartmentId,
    })!;
    const created = await this.ticketRepository.create(ticket);
    const ticketDto = TicketDto.from(created)!;
    await this.ticketMessagingService.publishTicketCreated(ticketDto);
    return ticketDto;
  }

  async listPaginated(page = 1, limit = 10): Promise<PaginatedResult<TicketDto>> {
    const all = await this.ticketRepository.findAll();
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit).map((t) => TicketDto.from(t)!);
    return { data, total, page, limit };
  }

  async listByResidentPaginated(residentId: string, page = 1, limit = 10): Promise<PaginatedResult<TicketDto>> {
    const all = await this.ticketRepository.findByResidentId(residentId);
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit).map((t) => TicketDto.from(t)!);
    return { data, total, page, limit };
  }

  async listByCondominiumPaginated(condominiumId: string, page = 1, limit = 10): Promise<PaginatedResult<TicketDto>> {
    const all = await this.ticketRepository.findByCondominiumId(condominiumId);
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit).map((t) => TicketDto.from(t)!);
    return { data, total, page, limit };
  }

  async listByApartmentPaginated(apartmentId: string, page = 1, limit = 10): Promise<PaginatedResult<TicketDto>> {
    const all = await this.ticketRepository.findByApartmentId(apartmentId);
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit).map((t) => TicketDto.from(t)!);
    return { data, total, page, limit };
  }

  async findById(id: string): Promise<TicketDto> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) throw new NotFoundException("Ticket não encontrado");
    return TicketDto.from(ticket)!;
  }

  async update(id: string, dto: UpdateTicketDto): Promise<void> {
    if (!dto.title && !dto.description && !dto.location && !dto.status) {
      throw new BadRequestException("Ao menos um campo deve ser informado para atualização");
    }
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) throw new NotFoundException("Ticket não encontrado");

    const oldStatus = ticket.status;
    if (dto.title) ticket.withTitle(dto.title);
    if (dto.description) ticket.withDescription(dto.description);
    if (dto.location) ticket.withLocation(dto.location);
    if (dto.status) ticket.withStatus(dto.status);

    await this.ticketRepository.update(ticket);

    if (dto.status && dto.status !== oldStatus) {
      await this.ticketMessagingService.publishTicketStatusChanged(
        ticket.id!,
        ticket.residentId,
        oldStatus,
        ticket.status,
      );
    }
  }

  async delete(id: string): Promise<void> {
    const ticket = await this.ticketRepository.findById(id);
    if (!ticket) throw new NotFoundException("Ticket não encontrado");
    await this.ticketRepository.delete(id);
  }
}
