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
import { ProviderService } from '../../application/services/provider.service';
import { CreateProviderDto } from '../../application/dto/create-provider.dto';
import { UpdateProviderDto } from '../../application/dto/update-provider.dto';
import { ProviderDto } from '../../application/dto/provider.dto';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';
import { HateoasItem, HateoasList } from '@shared/infra/hateoas';

@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get()
  @RequirePermissions(Permission.PROVIDERS_READ)
  @HateoasList<ProviderDto>({
    basePath: '/v1/providers',
    itemLinks: (item) => ({
      self: { href: `/v1/providers/${item.id}`, method: 'GET' },
      update: { href: `/v1/providers/${item.id}`, method: 'PUT' },
      delete: { href: `/v1/providers/${item.id}`, method: 'DELETE' },
    }),
  })
  async findAll() {
    return this.providerService.findAll();
  }

  @Get(':id')
  @RequirePermissions(Permission.PROVIDERS_READ)
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
  async create(@Body() dto: CreateProviderDto) {
    return this.providerService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.PROVIDERS_WRITE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providerService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.PROVIDERS_DELETE)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.providerService.delete(id);
  }
}
