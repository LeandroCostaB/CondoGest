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
import { ProviderService } from '../../application/services/provider.service';
import { CreateProviderDto } from '../../application/dto/create-provider.dto';
import { UpdateProviderDto } from '../../application/dto/update-provider.dto';
import { ProviderDto } from '../../application/dto/provider.dto';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';
import { HateoasItem, HateoasList } from '@shared/infra/hateoas';

@ApiTags('providers')
@ApiBearerAuth()
@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get()
  @RequirePermissions(Permission.PROVIDERS_READ)
  @ApiOperation({ summary: 'Listar prestadores de serviço' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Lista paginada de prestadores.', type: ProviderDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  @HateoasList<ProviderDto>({
    basePath: '/v1/providers',
    itemLinks: (item) => ({
      self: { href: `/v1/providers/${item.id}`, method: 'GET' },
      update: { href: `/v1/providers/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/providers/${item.id}`, method: 'DELETE' },
    }),
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.providerService.findAll(page, limit);
  }

  @Get(':id')
  @RequirePermissions(Permission.PROVIDERS_READ)
  @ApiOperation({ summary: 'Buscar prestador por ID' })
  @ApiResponse({ status: 200, description: 'Prestador encontrado.', type: ProviderDto })
  @ApiNotFoundResponse({ description: 'Prestador não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  @HateoasItem<ProviderDto>({
    basePath: '/v1/providers',
    itemLinks: (item) => ({
      self: { href: `/v1/providers/${item.id}`, method: 'GET' },
      list: { href: '/v1/providers', method: 'GET' },
      update: { href: `/v1/providers/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/providers/${item.id}`, method: 'DELETE' },
    }),
  })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.providerService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.PROVIDERS_WRITE)
  @ApiOperation({ summary: 'Criar prestador de serviço' })
  @ApiResponse({ status: 201, description: 'Prestador criado com sucesso.', type: ProviderDto })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async create(@Body() dto: CreateProviderDto) {
    return this.providerService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.PROVIDERS_WRITE)
  @ApiOperation({ summary: 'Atualizar prestador' })
  @ApiNoContentResponse({ description: 'Prestador atualizado.' })
  @ApiNotFoundResponse({ description: 'Prestador não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providerService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.PROVIDERS_DELETE)
  @ApiOperation({ summary: 'Remover prestador' })
  @ApiNoContentResponse({ description: 'Prestador removido.' })
  @ApiNotFoundResponse({ description: 'Prestador não encontrado.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.providerService.delete(id);
  }
}
