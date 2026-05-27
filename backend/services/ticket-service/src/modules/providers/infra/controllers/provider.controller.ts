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
import { ProviderDto } from "@providers/application/dto/provider.dto";
import { CreateProviderDto } from "@providers/application/dto/create-provider.dto";
import { UpdateProviderDto } from "@providers/application/dto/update-provider.dto";
import { ProviderService } from "@providers/application/services/provider.service";

@ApiTags("providers")
@ApiBearerAuth()
@Controller("providers")
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  @RequirePermissions(Permission.PROVIDERS_WRITE)
  @ApiOperation({ summary: "Criar prestador de serviço" })
  @ApiCreatedResponse({ type: ProviderDto })
  async create(@Body() dto: CreateProviderDto): Promise<ProviderDto> {
    return this.providerService.create(dto);
  }

  @Get()
  @RequirePermissions(Permission.PROVIDERS_READ)
  @ApiOperation({ summary: "Listar prestadores" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<ProviderDto>({
    basePath: "/v1/providers",
    itemLinks: (item) => ({
      self: { href: `/v1/providers/${item.id}`, method: "GET" },
      update: { href: `/v1/providers/${item.id}`, method: "PUT" },
      delete: { href: `/v1/providers/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.providerService.listPaginated(page, limit);
  }

  @Get(":id")
  @RequirePermissions(Permission.PROVIDERS_READ)
  @ApiOperation({ summary: "Buscar prestador por ID" })
  @ApiNotFoundResponse({ description: "Prestador não encontrado" })
  @HateoasItem<ProviderDto>({
    basePath: "/v1/providers",
    itemLinks: (item) => ({
      self: { href: `/v1/providers/${item.id}`, method: "GET" },
      update: { href: `/v1/providers/${item.id}`, method: "PUT" },
      delete: { href: `/v1/providers/${item.id}`, method: "DELETE" },
      list: { href: "/v1/providers", method: "GET" },
    }),
  })
  async findById(@Param("id", ParseUUIDPipe) id: string): Promise<ProviderDto> {
    return this.providerService.findById(id);
  }

  @Put(":id")
  @RequirePermissions(Permission.PROVIDERS_WRITE)
  @ApiOperation({ summary: "Atualizar prestador" })
  @ApiNotFoundResponse({ description: "Prestador não encontrado" })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateProviderDto,
  ): Promise<void> {
    return this.providerService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.PROVIDERS_DELETE)
  @ApiOperation({ summary: "Remover prestador" })
  @ApiNoContentResponse({ description: "Prestador removido" })
  @ApiNotFoundResponse({ description: "Prestador não encontrado" })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
    return this.providerService.delete(id);
  }
}
