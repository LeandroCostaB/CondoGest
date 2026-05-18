import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { TicketService } from '../../application/services/ticket.service';
import { CreateTicketDto } from '../../application/dto/create-ticket.dto';
import { UpdateTicketDto } from '../../application/dto/update-ticket.dto';
import { TicketDto } from '../../application/dto/ticket.dto';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';
import { HateoasItem, HateoasList } from '@shared/infra/hateoas';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @RequirePermissions(Permission.TICKETS_READ)
  @HateoasList<TicketDto>({
    basePath: '/v1/tickets',
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: 'GET' },
      update: { href: `/v1/tickets/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/tickets/${item.id}`, method: 'DELETE' },
    }),
  })
  async findAll() {
    return this.ticketService.findAll();
  }

  @Get('resident/:residentId')
  @RequirePermissions(Permission.TICKETS_READ)
  @HateoasList<TicketDto>({
    basePath: '/v1/tickets',
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: 'GET' },
      update: { href: `/v1/tickets/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/tickets/${item.id}`, method: 'DELETE' },
    }),
  })
  async findByResidentId(@Param('residentId', ParseUUIDPipe) residentId: string) {
    return this.ticketService.findByResidentId(residentId);
  }

  @Get('apartment/:apartmentId')
  @RequirePermissions(Permission.TICKETS_READ)
  @HateoasList<TicketDto>({
    basePath: '/v1/tickets',
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: 'GET' },
      update: { href: `/v1/tickets/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/tickets/${item.id}`, method: 'DELETE' },
    }),
  })
  async findByApartmentId(@Param('apartmentId', ParseUUIDPipe) apartmentId: string) {
    return this.ticketService.findByApartmentId(apartmentId);
  }

  @Get(':id')
  @RequirePermissions(Permission.TICKETS_READ)
  @HateoasItem<TicketDto>({
    basePath: '/v1/tickets',
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: 'GET' },
      list: { href: '/v1/tickets', method: 'GET' },
      update: { href: `/v1/tickets/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/tickets/${item.id}`, method: 'DELETE' },
      maintenances: { href: `/v1/maintenances/ticket/${item.id}`, method: 'GET' },
    }),
  })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.TICKETS_WRITE)
  async create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.TICKETS_WRITE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.TICKETS_DELETE)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketService.delete(id);
  }
}
