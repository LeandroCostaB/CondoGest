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
import { MaintenanceService } from '../../application/services/maintenance.service';
import { CreateMaintenanceDto } from '../../application/dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../../application/dto/update-maintenance.dto';
import { MaintenanceDto } from '../../application/dto/maintenance.dto';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';
import { HateoasItem, HateoasList } from '@shared/infra/hateoas';

@ApiTags('maintenances')
@ApiBearerAuth()
@Controller('maintenances')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @RequirePermissions(Permission.MAINTENANCES_READ)
  @ApiOperation({ summary: 'Listar manutenções' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista paginada de manutenções.', type: MaintenanceDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  @HateoasList<MaintenanceDto>({
    basePath: '/v1/maintenances',
    itemLinks: (item) => ({
      self: { href: `/v1/maintenances/${item.id}`, method: 'GET' },
      update: { href: `/v1/maintenances/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/maintenances/${item.id}`, method: 'DELETE' },
    }),
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.maintenanceService.findAll(page, limit);
  }

  @Get('ticket/:ticketId')
  @RequirePermissions(Permission.MAINTENANCES_READ)
  @ApiOperation({ summary: 'Listar manutenções de um ticket' })
  @ApiResponse({ status: 200, description: 'Manutenções do ticket.', type: MaintenanceDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Ticket não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async findByTicketId(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.maintenanceService.findByTicketId(ticketId);
  }

  @Get(':id')
  @RequirePermissions(Permission.MAINTENANCES_READ)
  @ApiOperation({ summary: 'Buscar manutenção por ID' })
  @ApiResponse({ status: 200, description: 'Manutenção encontrada.', type: MaintenanceDto })
  @ApiNotFoundResponse({ description: 'Manutenção não encontrada.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  @HateoasItem<MaintenanceDto>({
    basePath: '/v1/maintenances',
    itemLinks: (item) => ({
      self: { href: `/v1/maintenances/${item.id}`, method: 'GET' },
      list: { href: '/v1/maintenances', method: 'GET' },
      update: { href: `/v1/maintenances/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/maintenances/${item.id}`, method: 'DELETE' },
    }),
  })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenanceService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.MAINTENANCES_WRITE)
  @ApiOperation({ summary: 'Criar manutenção' })
  @ApiResponse({ status: 201, description: 'Manutenção criada com sucesso.', type: MaintenanceDto })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.MAINTENANCES_WRITE)
  @ApiOperation({ summary: 'Atualizar manutenção' })
  @ApiNoContentResponse({ description: 'Manutenção atualizada.' })
  @ApiNotFoundResponse({ description: 'Manutenção não encontrada.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.MAINTENANCES_DELETE)
  @ApiOperation({ summary: 'Remover manutenção' })
  @ApiNoContentResponse({ description: 'Manutenção removida.' })
  @ApiNotFoundResponse({ description: 'Manutenção não encontrada.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenanceService.delete(id);
  }
}
