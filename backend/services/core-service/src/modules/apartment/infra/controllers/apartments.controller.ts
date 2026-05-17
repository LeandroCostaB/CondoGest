import { ApartmentDto } from "@apartment/application/dto/apartment.dto";
import { CreateApartmentDto } from "@apartment/application/dto/create-apartment.dto";
import { UpdateApartmentDto } from "@apartment/application/dto/update-apartment.dto";
import { ApartmentService } from "@apartment/application/services/apartment.service";
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
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("apartments")
@ApiBearerAuth("JWT")
@Controller("condominiums/:condominiumId/apartments")
export class ApartmentsController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Get()
  @ApiOperation({ summary: "Listar apartamentos de um condomínio" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOkResponse({ description: "Lista de apartamentos", type: [ApartmentDto] })
  @ApiUnauthorizedResponse({ description: "Token ausente ou inválido" })
  @ApiForbiddenResponse({ description: "Sem permissão" })
  @ApiNotFoundResponse({ description: "Condomínio não encontrado" })
  @RequirePermissions(Permission.APARTMENTS_READ)
  @HateoasList<ApartmentDto>({
    basePath: "/v1/condominiums",
    itemLinks: (item) => ({
      self: {
        href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`,
        method: "GET",
      },
      update: {
        href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`,
        method: "PUT",
      },
      delete: {
        href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`,
        method: "DELETE",
      },
    }),
  })
  async findAll(
    @CurrentUser() user: { sub: string },
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.apartmentService.listByCondominium(condominiumId, user.sub, {
      page,
      limit,
    });
  }

  @Get(":apartmentId")
  @ApiOperation({ summary: "Buscar apartamento por ID" })
  @ApiOkResponse({ description: "Apartamento encontrado", type: ApartmentDto })
  @ApiUnauthorizedResponse({ description: "Token ausente ou inválido" })
  @ApiForbiddenResponse({ description: "Sem permissão" })
  @ApiNotFoundResponse({ description: "Apartamento não encontrado" })
  @RequirePermissions(Permission.APARTMENTS_READ)
  @HateoasItem<ApartmentDto>({
    basePath: "/v1/condominiums",
    itemLinks: (item) => ({
      self: {
        href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`,
        method: "GET",
      },
      list: {
        href: `/v1/condominiums/${item.condominiumId}/apartments`,
        method: "GET",
      },
      update: {
        href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`,
        method: "PUT",
      },
      delete: {
        href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`,
        method: "DELETE",
      },
    }),
  })
  async findById(
    @CurrentUser() user: { sub: string },
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Param("apartmentId", ParseUUIDPipe) apartmentId: string,
  ) {
    return this.apartmentService.findById(condominiumId, apartmentId, user.sub);
  }

  @Post()
  @ApiOperation({ summary: "Criar apartamento em um condomínio" })
  @ApiCreatedResponse({ description: "Apartamento criado", type: ApartmentDto })
  @ApiUnauthorizedResponse({ description: "Token ausente ou inválido" })
  @ApiForbiddenResponse({ description: "Sem permissão" })
  @ApiNotFoundResponse({ description: "Condomínio não encontrado" })
  @RequirePermissions(Permission.APARTMENTS_WRITE)
  async create(
    @CurrentUser() user: { sub: string },
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Body() body: CreateApartmentDto,
  ) {
    return this.apartmentService.create(condominiumId, body, user.sub);
  }

  @Put(":apartmentId")
  @ApiOperation({ summary: "Atualizar apartamento" })
  @ApiOkResponse({ description: "Apartamento atualizado", type: ApartmentDto })
  @ApiUnauthorizedResponse({ description: "Token ausente ou inválido" })
  @ApiForbiddenResponse({ description: "Sem permissão" })
  @ApiNotFoundResponse({ description: "Apartamento não encontrado" })
  @RequirePermissions(Permission.APARTMENTS_WRITE)
  async update(
    @CurrentUser() user: { sub: string },
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Param("apartmentId", ParseUUIDPipe) apartmentId: string,
    @Body() body: UpdateApartmentDto,
  ) {
    return this.apartmentService.update(
      condominiumId,
      apartmentId,
      body,
      user.sub,
    );
  }

  @Delete(":apartmentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Excluir apartamento" })
  @ApiNoContentResponse({ description: "Apartamento excluído" })
  @ApiUnauthorizedResponse({ description: "Token ausente ou inválido" })
  @ApiForbiddenResponse({ description: "Sem permissão" })
  @ApiNotFoundResponse({ description: "Apartamento não encontrado" })
  @RequirePermissions(Permission.APARTMENTS_DELETE)
  async delete(
    @CurrentUser() user: { sub: string },
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Param("apartmentId", ParseUUIDPipe) apartmentId: string,
  ) {
    return this.apartmentService.delete(condominiumId, apartmentId, user.sub);
  }
}
