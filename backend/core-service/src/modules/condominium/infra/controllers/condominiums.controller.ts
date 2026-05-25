import { CondominiumDto } from "@condominium/application/dto/condominium.dto";
import { CreateCondominiumDto } from "@condominium/application/dto/create-condominium.dto";
import { UpdateCondominiumDto } from "@condominium/application/dto/update-condominium.dto";
import { CondominiumService } from "@condominium/application/services/condominium.service";
import { CondominiumStatus } from "@condominium/domain/models/condominium.entity";
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
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("condominiums")
@ApiBearerAuth()
@Controller("condominiums")
export class CondominiumsController {
  constructor(private readonly condominiumService: CondominiumService) {}

  @Get()
  @ApiOperation({ summary: "Listar condomínios do usuário" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiUnauthorizedResponse({ description: "Usuário não autenticado" })
  @ApiForbiddenResponse({ description: "Usuário sem permissão" })
  @RequirePermissions(Permission.CONDOMINIUMS_READ)
  @HateoasList<CondominiumDto>({
    basePath: "/v1/condominiums",
    itemLinks: (item) => ({
      self: { href: `/v1/condominiums/${item.id}`, method: "GET" },
      update: { href: `/v1/condominiums/${item.id}`, method: "PUT" },
      activate:
        item.status === "inactive"
          ? { href: `/v1/condominiums/${item.id}/activate`, method: "PATCH" }
          : null,
      deactivate:
        item.status === "active"
          ? { href: `/v1/condominiums/${item.id}/deactivate`, method: "PATCH" }
          : null,
      delete: { href: `/v1/condominiums/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @CurrentUser() user: { sub: string },
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.condominiumService.listByUserPaginated(user.sub, {
      page,
      limit,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar condomínio por ID" })
  @ApiNotFoundResponse({ description: "Condomínio não encontrado" })
  @ApiUnauthorizedResponse({ description: "Usuário não autenticado" })
  @ApiForbiddenResponse({ description: "Usuário sem permissão" })
  @RequirePermissions(Permission.CONDOMINIUMS_READ)
  @HateoasItem<CondominiumDto>({
    basePath: "/v1/condominiums",
    itemLinks: (item) => ({
      self: { href: `/v1/condominiums/${item.id}`, method: "GET" },
      list: { href: "/v1/condominiums", method: "GET" },
      update: { href: `/v1/condominiums/${item.id}`, method: "PUT" },
      activate:
        item.status === "inactive"
          ? { href: `/v1/condominiums/${item.id}/activate`, method: "PATCH" }
          : null,
      deactivate:
        item.status === "active"
          ? { href: `/v1/condominiums/${item.id}/deactivate`, method: "PATCH" }
          : null,
      delete: { href: `/v1/condominiums/${item.id}`, method: "DELETE" },
    }),
  })
  async findById(
    @CurrentUser() user: { sub: string },
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.condominiumService.findByIdForUser(id, user.sub);
  }

  @Post()
  @ApiOperation({ summary: "Criar condomínio" })
  @ApiUnauthorizedResponse({ description: "Usuário não autenticado" })
  @ApiForbiddenResponse({ description: "Usuário sem permissão" })
  @RequirePermissions(Permission.CONDOMINIUMS_WRITE)
  async create(
    @CurrentUser() user: { sub: string },
    @Body() body: CreateCondominiumDto,
  ) {
    return this.condominiumService.create(body, user.sub);
  }

  @Put(":id")
  @ApiOperation({ summary: "Atualizar condomínio" })
  @ApiNotFoundResponse({ description: "Condomínio não encontrado" })
  @ApiUnauthorizedResponse({ description: "Usuário não autenticado" })
  @ApiForbiddenResponse({ description: "Usuário sem permissão" })
  @RequirePermissions(Permission.CONDOMINIUMS_WRITE)
  async update(
    @CurrentUser() user: { sub: string },
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: UpdateCondominiumDto,
  ) {
    return this.condominiumService.update(id, body, user.sub);
  }

  @Patch(":id/activate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Ativar condomínio" })
  @ApiNoContentResponse({ description: "Condomínio ativado" })
  @ApiNotFoundResponse({ description: "Condomínio não encontrado" })
  @ApiUnauthorizedResponse({ description: "Usuário não autenticado" })
  @ApiForbiddenResponse({ description: "Usuário sem permissão" })
  @RequirePermissions(Permission.CONDOMINIUMS_WRITE)
  async activate(
    @CurrentUser() user: { sub: string },
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.condominiumService.changeStatus(
      id,
      CondominiumStatus.ACTIVE,
      user.sub,
    );
  }

  @Patch(":id/deactivate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Desativar condomínio" })
  @ApiNoContentResponse({ description: "Condomínio desativado" })
  @ApiNotFoundResponse({ description: "Condomínio não encontrado" })
  @ApiUnauthorizedResponse({ description: "Usuário não autenticado" })
  @ApiForbiddenResponse({ description: "Usuário sem permissão" })
  @RequirePermissions(Permission.CONDOMINIUMS_WRITE)
  async deactivate(
    @CurrentUser() user: { sub: string },
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.condominiumService.changeStatus(
      id,
      CondominiumStatus.INACTIVE,
      user.sub,
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Excluir condomínio" })
  @ApiNoContentResponse({ description: "Condomínio excluído" })
  @ApiNotFoundResponse({ description: "Condomínio não encontrado" })
  @ApiUnauthorizedResponse({ description: "Usuário não autenticado" })
  @ApiForbiddenResponse({ description: "Usuário sem permissão" })
  @RequirePermissions(Permission.CONDOMINIUMS_DELETE)
  async delete(
    @CurrentUser() user: { sub: string },
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.condominiumService.delete(id, user.sub);
  }
}
