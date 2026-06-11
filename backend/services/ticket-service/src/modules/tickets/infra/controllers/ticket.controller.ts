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
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";
import { TicketDto } from "@tickets/application/dto/ticket.dto";
import { CreateTicketDto } from "@tickets/application/dto/create-ticket.dto";
import { UpdateTicketDto } from "@tickets/application/dto/update-ticket.dto";
import { TicketService } from "@tickets/application/services/ticket.service";

@ApiTags("tickets")
@ApiBearerAuth()
@Controller("tickets")
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @RequirePermissions(Permission.TICKETS_WRITE)
  @ApiOperation({ summary: "Criar chamado" })
  @ApiCreatedResponse({ type: TicketDto })
  async create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TicketDto> {
    return this.ticketService.create(dto, user.sub);
  }

  @Get()
  @RequirePermissions(Permission.TICKETS_READ)
  @ApiOperation({ summary: "Listar chamados" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<TicketDto>({
    basePath: "/v1/tickets",
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: "GET" },
      update: { href: `/v1/tickets/${item.id}`, method: "PUT" },
      delete: { href: `/v1/tickets/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ticketService.listPaginated(page, limit);
  }

  @Get("condominium/:condominiumId")
  @RequirePermissions(Permission.TICKETS_READ)
  @ApiOperation({ summary: "Listar chamados por condomínio" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<TicketDto>({
    basePath: "/v1/tickets",
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: "GET" },
      update: { href: `/v1/tickets/${item.id}`, method: "PUT" },
      delete: { href: `/v1/tickets/${item.id}`, method: "DELETE" },
    }),
  })
  async findByCondominium(
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ticketService.listByCondominiumPaginated(condominiumId, page, limit);
  }

  @Get("apartment/:apartmentId")
  @RequirePermissions(Permission.TICKETS_READ)
  @ApiOperation({ summary: "Listar chamados por apartamento" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<TicketDto>({
    basePath: "/v1/tickets",
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: "GET" },
      update: { href: `/v1/tickets/${item.id}`, method: "PUT" },
      delete: { href: `/v1/tickets/${item.id}`, method: "DELETE" },
    }),
  })
  async findByApartment(
    @Param("apartmentId", ParseUUIDPipe) apartmentId: string,
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ticketService.listByApartmentPaginated(apartmentId, page, limit);
  }

  @Get("mine")
  @RequirePermissions(Permission.TICKETS_READ)
  @ApiOperation({ summary: "Listar meus chamados" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<TicketDto>({
    basePath: "/v1/tickets/mine",
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: "GET" },
      update: { href: `/v1/tickets/${item.id}`, method: "PUT" },
    }),
  })
  async findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.ticketService.listByResidentPaginated(user.sub, page, limit);
  }

  @Get(":id")
  @RequirePermissions(Permission.TICKETS_READ)
  @ApiOperation({ summary: "Buscar chamado por ID" })
  @ApiNotFoundResponse({ description: "Ticket não encontrado" })
  @HateoasItem<TicketDto>({
    basePath: "/v1/tickets",
    itemLinks: (item) => ({
      self: { href: `/v1/tickets/${item.id}`, method: "GET" },
      update: { href: `/v1/tickets/${item.id}`, method: "PUT" },
      delete: { href: `/v1/tickets/${item.id}`, method: "DELETE" },
      list: { href: "/v1/tickets", method: "GET" },
    }),
  })
  async findById(@Param("id", ParseUUIDPipe) id: string): Promise<TicketDto> {
    return this.ticketService.findById(id);
  }

  @Put(":id")
  @RequirePermissions(Permission.TICKETS_WRITE)
  @ApiOperation({ summary: "Atualizar chamado" })
  @ApiNotFoundResponse({ description: "Ticket não encontrado" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ): Promise<void> {
    return this.ticketService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.TICKETS_DELETE)
  @ApiOperation({ summary: "Remover chamado" })
  @ApiNoContentResponse({ description: "Chamado removido" })
  @ApiNotFoundResponse({ description: "Ticket não encontrado" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.ticketService.delete(id);
  }
}
