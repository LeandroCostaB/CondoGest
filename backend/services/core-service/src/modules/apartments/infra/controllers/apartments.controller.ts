import { ApartmentDto } from "@apartments/application/dto/apartment.dto";
import { AssignResidentDto } from "@apartments/application/dto/assign-resident.dto";
import { CreateApartmentDto } from "@apartments/application/dto/create-apartment.dto";
import { UpdateApartmentDto } from "@apartments/application/dto/update-apartment.dto";
import { ApartmentService } from "@apartments/application/services/apartment.service";
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
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("apartments")
@ApiBearerAuth()
@Controller("condominiums/:condominiumId/apartments")
export class ApartmentsController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Get()
  @RequirePermissions(Permission.APARTMENTS_READ)
  @ApiOperation({ summary: "Listar apartamentos de um condomínio" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @HateoasList<ApartmentDto>({
    basePath: "/v1/condominiums",
    itemLinks: (item) => ({
      self: { href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`, method: "GET" },
      update: { href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`, method: "PUT" },
      delete: { href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.apartmentService.listByCondominium(condominiumId, user.sub, { page, limit });
  }

  @Get(":apartmentId")
  @RequirePermissions(Permission.APARTMENTS_READ)
  @ApiOperation({ summary: "Buscar apartamento por ID" })
  @ApiNotFoundResponse({ description: "Apartamento não encontrado" })
  @HateoasItem<ApartmentDto>({
    basePath: "/v1/condominiums",
    itemLinks: (item) => ({
      self: { href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`, method: "GET" },
      list: { href: `/v1/condominiums/${item.condominiumId}/apartments`, method: "GET" },
      update: { href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`, method: "PUT" },
      delete: { href: `/v1/condominiums/${item.condominiumId}/apartments/${item.id}`, method: "DELETE" },
    }),
  })
  async findById(
    @CurrentUser() user: AuthenticatedUser,
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Param("apartmentId", ParseUUIDPipe) apartmentId: string,
  ) {
    return this.apartmentService.findById(condominiumId, apartmentId, user.sub);
  }

  @Post()
  @RequirePermissions(Permission.APARTMENTS_WRITE)
  @ApiOperation({ summary: "Criar apartamento em um condomínio" })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Body() dto: CreateApartmentDto,
  ) {
    return this.apartmentService.create(condominiumId, dto, user.sub);
  }

  @Put(":apartmentId")
  @RequirePermissions(Permission.APARTMENTS_WRITE)
  @ApiOperation({ summary: "Atualizar apartamento" })
  @ApiNotFoundResponse({ description: "Apartamento não encontrado" })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Param("apartmentId", ParseUUIDPipe) apartmentId: string,
    @Body() dto: UpdateApartmentDto,
  ) {
    return this.apartmentService.update(condominiumId, apartmentId, dto, user.sub);
  }

  @Patch(":apartmentId/resident")
  @ApiOperation({ summary: "Atribuir ou remover morador de um apartamento" })
  @ApiUnauthorizedResponse({ description: "Usuário não autenticado" })
  @ApiForbiddenResponse({ description: "Usuário sem permissão" })
  @ApiNotFoundResponse({ description: "Condomínio ou apartamento não encontrado" })
  @RequirePermissions(Permission.APARTMENTS_WRITE)
  async assignResident(
    @CurrentUser() user: { sub: string },
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Param("apartmentId", ParseUUIDPipe) apartmentId: string,
    @Body() dto: AssignResidentDto,
  ) {
    return this.apartmentService.assignResident(
      condominiumId,
      apartmentId,
      dto.userId ?? null,
      user.sub,
    );
  }

  @Delete(":apartmentId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.APARTMENTS_DELETE)
  @ApiOperation({ summary: "Excluir apartamento" })
  @ApiNoContentResponse({ description: "Apartamento excluído" })
  async delete(
    @CurrentUser() user: AuthenticatedUser,
    @Param("condominiumId", ParseUUIDPipe) condominiumId: string,
    @Param("apartmentId", ParseUUIDPipe) apartmentId: string,
  ) {
    return this.apartmentService.delete(condominiumId, apartmentId, user.sub);
  }
}
