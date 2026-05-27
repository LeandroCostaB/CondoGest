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
import { UserDto } from "@users/application/dto/user.dto";
import { UpdateUserDto } from "@users/application/dto/update-user.dto";
import { UserService } from "@users/application/services/user.service";

@ApiTags("users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: "Listar usuários" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<UserDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      update: { href: `/v1/users/${item.id}`, method: "PUT" },
      delete: { href: `/v1/users/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.userService.listPaginated({ page, limit });
  }

  @Get(":id")
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @HateoasItem<UserDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      update: { href: `/v1/users/${item.id}`, method: "PUT" },
      delete: { href: `/v1/users/${item.id}`, method: "DELETE" },
      list: { href: "/v1/users", method: "GET" },
    }),
  })
  async findById(@Param("id", ParseUUIDPipe) id: string) {
    return this.userService.findById(id);
  }

  @Put(":id")
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: "Atualizar usuário" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async update(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.USERS_DELETE)
  @ApiOperation({ summary: "Remover usuário" })
  @ApiNoContentResponse({ description: "Usuário removido" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.userService.delete(id);
  }

  @Patch("fcm-token")
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: "Atualizar token FCM do usuário autenticado" })
  async updateFcmToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body("token") token: string,
  ) {
    return this.userService.updateFcmToken(user.sub, token);
  }
}
