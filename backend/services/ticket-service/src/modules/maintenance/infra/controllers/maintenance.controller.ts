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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";
import { MaintenanceDto } from "@maintenance/application/dto/maintenance.dto";
import { CreateMaintenanceDto } from "@maintenance/application/dto/create-maintenance.dto";
import { UpdateMaintenanceDto } from "@maintenance/application/dto/update-maintenance.dto";
import { MaintenanceService } from "@maintenance/application/services/maintenance.service";

@ApiTags("maintenances")
@ApiBearerAuth()
@Controller("maintenances")
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @RequirePermissions(Permission.MAINTENANCES_WRITE)
  @ApiOperation({ summary: "Criar manutenção" })
  @ApiCreatedResponse({ type: MaintenanceDto })
  async create(@Body() dto: CreateMaintenanceDto): Promise<MaintenanceDto> {
    return this.maintenanceService.create(dto);
  }

  @Get()
  @RequirePermissions(Permission.MAINTENANCES_READ)
  @ApiOperation({ summary: "Listar manutenções" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<MaintenanceDto>({
    basePath: "/v1/maintenances",
    itemLinks: (item) => ({
      self: { href: `/v1/maintenances/${item.id}`, method: "GET" },
      update: { href: `/v1/maintenances/${item.id}`, method: "PUT" },
      delete: { href: `/v1/maintenances/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.maintenanceService.listPaginated(page, limit);
  }

  @Get("ticket/:ticketId")
  @RequirePermissions(Permission.MAINTENANCES_READ)
  @ApiOperation({ summary: "Listar manutenções por chamado" })
  async findByTicketId(@Param("ticketId", ParseUUIDPipe) ticketId: string): Promise<MaintenanceDto[]> {
    return this.maintenanceService.findByTicketId(ticketId);
  }

  @Get("apartment/:apartmentId")
  @RequirePermissions(Permission.MAINTENANCES_READ)
  @ApiOperation({ summary: "Listar manutenções por apartamento" })
  async findByApartmentId(@Param("apartmentId", ParseUUIDPipe) apartmentId: string): Promise<MaintenanceDto[]> {
    return this.maintenanceService.findByApartmentId(apartmentId);
  }

  @Get(":id")
  @RequirePermissions(Permission.MAINTENANCES_READ)
  @ApiOperation({ summary: "Buscar manutenção por ID" })
  @ApiNotFoundResponse({ description: "Manutenção não encontrada" })
  @HateoasItem<MaintenanceDto>({
    basePath: "/v1/maintenances",
    itemLinks: (item) => ({
      self: { href: `/v1/maintenances/${item.id}`, method: "GET" },
      update: { href: `/v1/maintenances/${item.id}`, method: "PUT" },
      delete: { href: `/v1/maintenances/${item.id}`, method: "DELETE" },
      list: { href: "/v1/maintenances", method: "GET" },
    }),
  })
  async findById(@Param("id", ParseUUIDPipe) id: string): Promise<MaintenanceDto> {
    return this.maintenanceService.findById(id);
  }

  @Put(":id")
  @RequirePermissions(Permission.MAINTENANCES_WRITE)
  @ApiOperation({ summary: "Atualizar manutenção" })
  @ApiNotFoundResponse({ description: "Manutenção não encontrada" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceDto,
  ): Promise<void> {
    return this.maintenanceService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.MAINTENANCES_DELETE)
  @ApiOperation({ summary: "Remover manutenção" })
  @ApiNoContentResponse({ description: "Manutenção removida" })
  @ApiNotFoundResponse({ description: "Manutenção não encontrada" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.maintenanceService.delete(id);
  }
}
