import { CondominiumDto } from "@condominiums/application/dto/condominium.dto";
import { CreateCondominiumDto } from "@condominiums/application/dto/create-condominium.dto";
import { UpdateCondominiumDto } from "@condominiums/application/dto/update-condominium.dto";
import { CondominiumService } from "@condominiums/application/services/condominium.service";
import { CondominiumStatus } from "@condominiums/domain/models/condominium.entity";
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
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("condominiums")
@ApiBearerAuth()
@Controller("condominiums")
export class CondominiumsController {
  constructor(private readonly condominiumService: CondominiumService) {}

  @Get()
  @RequirePermissions(Permission.CONDOMINIUMS_READ)
  @ApiOperation({ summary: "Listar condomínios do usuário" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @HateoasList<CondominiumDto>({
    basePath: "/v1/condominiums",
    itemLinks: (item) => ({
      self: { href: `/v1/condominiums/${item.id}`, method: "GET" },
      update: { href: `/v1/condominiums/${item.id}`, method: "PUT" },
      activate: item.status === "inactive" ? { href: `/v1/condominiums/${item.id}/activate`, method: "PATCH" } : null,
      deactivate: item.status === "active" ? { href: `/v1/condominiums/${item.id}/deactivate`, method: "PATCH" } : null,
      delete: { href: `/v1/condominiums/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.condominiumService.listByUserPaginated(user.sub, { page, limit });
  }

  @Get(":id")
  @RequirePermissions(Permission.CONDOMINIUMS_READ)
  @ApiOperation({ summary: "Buscar condomínio por ID" })
  @ApiNotFoundResponse({ description: "Condomínio não encontrado" })
  @HateoasItem<CondominiumDto>({
    basePath: "/v1/condominiums",
    itemLinks: (item) => ({
      self: { href: `/v1/condominiums/${item.id}`, method: "GET" },
      list: { href: "/v1/condominiums", method: "GET" },
      update: { href: `/v1/condominiums/${item.id}`, method: "PUT" },
      apartments: { href: `/v1/condominiums/${item.id}/apartments`, method: "GET" },
      delete: { href: `/v1/condominiums/${item.id}`, method: "DELETE" },
    }),
  })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.condominiumService.findByIdForUser(id, user.sub);
  }

  @Post()
  @RequirePermissions(Permission.CONDOMINIUMS_WRITE)
  @ApiOperation({ summary: "Criar condomínio" })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCondominiumDto,
  ) {
    return this.condominiumService.create(dto, user.sub);
  }

  @Put(":id")
  @RequirePermissions(Permission.CONDOMINIUMS_WRITE)
  @ApiOperation({ summary: "Atualizar condomínio" })
  @ApiNotFoundResponse({ description: "Condomínio não encontrado" })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateCondominiumDto,
  ) {
    return this.condominiumService.update(id, dto, user.sub);
  }

  @Patch(":id/activate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.CONDOMINIUMS_WRITE)
  @ApiOperation({ summary: "Ativar condomínio" })
  @ApiNoContentResponse({ description: "Condomínio ativado" })
  async activate(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.condominiumService.changeStatus(id, CondominiumStatus.ACTIVE, user.sub);
  }

  @Patch(":id/deactivate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.CONDOMINIUMS_WRITE)
  @ApiOperation({ summary: "Desativar condomínio" })
  @ApiNoContentResponse({ description: "Condomínio desativado" })
  async deactivate(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.condominiumService.changeStatus(id, CondominiumStatus.INACTIVE, user.sub);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.CONDOMINIUMS_DELETE)
  @ApiOperation({ summary: "Excluir condomínio" })
  @ApiNoContentResponse({ description: "Condomínio excluído" })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.condominiumService.delete(id, user.sub);
  }
}
