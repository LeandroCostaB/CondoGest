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
import { MaintenanceService } from '../../application/services/maintenance.service';
import { CreateMaintenanceDto } from '../../application/dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../../application/dto/update-maintenance.dto';
import { MaintenanceDto } from '../../application/dto/maintenance.dto';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';
import { HateoasItem, HateoasList } from '@shared/infra/hateoas';

@Controller('maintenances')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @RequirePermissions(Permission.MAINTENANCES_READ)
  @HateoasList<MaintenanceDto>({
    basePath: '/v1/maintenances',
    itemLinks: (item) => ({
      self: { href: `/v1/maintenances/${item.id}`, method: 'GET' },
      update: { href: `/v1/maintenances/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/maintenances/${item.id}`, method: 'DELETE' },
    }),
  })
  async findAll() {
    return this.maintenanceService.findAll();
  }

  @Get('ticket/:ticketId')
  @RequirePermissions(Permission.MAINTENANCES_READ)
  async findByTicketId(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.maintenanceService.findByTicketId(ticketId);
  }

  @Get(':id')
  @RequirePermissions(Permission.MAINTENANCES_READ)
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
  async create(@Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.MAINTENANCES_WRITE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.MAINTENANCES_DELETE)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.maintenanceService.delete(id);
  }
}
