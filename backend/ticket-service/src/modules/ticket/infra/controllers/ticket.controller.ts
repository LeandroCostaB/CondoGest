import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TicketService } from '../../application/services/ticket.service';
import { CreateTicketDto } from '../../application/dto/create-ticket.dto';
import { UpdateTicketDto } from '../../application/dto/update-ticket.dto';
import { TicketDto } from '../../application/dto/ticket.dto';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';
import { HateoasItem, HateoasList } from '@shared/infra/hateoas';

@ApiTags('tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @RequirePermissions(Permission.TICKETS_READ)
  @ApiOperation({ summary: 'Listar todos os tickets' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista paginada de tickets.', type: TicketDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  @HateoasList<TicketDto>({
    basePath: '/v1/tickets',
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: 'GET' },
      update: { href: `/v1/tickets/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/tickets/${item.id}`, method: 'DELETE' },
    }),
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ticketService.findAll(page, limit);
  }

  @Get('resident/:residentId')
  @RequirePermissions(Permission.TICKETS_READ)
  @ApiOperation({ summary: 'Listar tickets de um residente' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista paginada de tickets do residente.', type: TicketDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  @HateoasList<TicketDto>({
    basePath: '/v1/tickets',
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: 'GET' },
      update: { href: `/v1/tickets/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/tickets/${item.id}`, method: 'DELETE' },
    }),
  })
  async findByResidentId(
    @Param('residentId', ParseUUIDPipe) residentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ticketService.findByResidentId(residentId, page, limit);
  }

  @Get('apartment/:apartmentId')
  @RequirePermissions(Permission.TICKETS_READ)
  @ApiOperation({ summary: 'Listar tickets de um apartamento' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista paginada de tickets do apartamento.', type: TicketDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  @HateoasList<TicketDto>({
    basePath: '/v1/tickets',
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: 'GET' },
      update: { href: `/v1/tickets/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/tickets/${item.id}`, method: 'DELETE' },
    }),
  })
  async findByApartmentId(
    @Param('apartmentId', ParseUUIDPipe) apartmentId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ticketService.findByApartmentId(apartmentId, page, limit);
  }

  @Get(':id')
  @RequirePermissions(Permission.TICKETS_READ)
  @ApiOperation({ summary: 'Buscar ticket por ID' })
  @ApiResponse({ status: 200, description: 'Ticket encontrado.', type: TicketDto })
  @ApiNotFoundResponse({ description: 'Ticket não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
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
  @ApiOperation({ summary: 'Criar ticket' })
  @ApiResponse({ status: 201, description: 'Ticket criado com sucesso.', type: TicketDto })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.TICKETS_WRITE)
  @ApiOperation({ summary: 'Atualizar ticket' })
  @ApiNoContentResponse({ description: 'Ticket atualizado.' })
  @ApiNotFoundResponse({ description: 'Ticket não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.TICKETS_DELETE)
  @ApiOperation({ summary: 'Remover ticket' })
  @ApiNoContentResponse({ description: 'Ticket removido.' })
  @ApiNotFoundResponse({ description: 'Ticket não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.ticketService.delete(id);
  }
}
