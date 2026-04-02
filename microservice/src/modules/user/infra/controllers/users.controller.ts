import { UserDto } from "@user/application/dto/user.dto";
import { CreateUserDto } from "@user/application/dto/create-user.dto";
import { UserService } from "@user/application/services/user.service";
import { UserStatus } from "@user/domain/models/user.entity";
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "@shared/infra/decorators/public.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Listar turmas" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<UserDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      activate:
        item.status === "inactive"
          ? { href: `/v1/users/${item.id}/activate`, method: "PATCH" }
          : null,
      deactivate:
        item.status === "active"
          ? { href: `/v1/users/${item.id}/deactivate`, method: "PATCH" }
          : null,
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.userService.listPaginated({ page, limit });
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Buscar turma por ID" })
  @ApiNotFoundResponse({ description: "Turma não encontrada" })
  @HateoasItem<UserDto>({
    basePath: "/v1/users",
    itemLinks: (item) => ({
      self: { href: `/v1/users/${item.id}`, method: "GET" },
      list: { href: "/v1/users", method: "GET" },
      create: { href: "/v1/users", method: "POST" },
      activate:
        item.status === "inactive"
          ? { href: `/v1/users/${item.id}/activate`, method: "PATCH" }
          : null,
      deactivate:
        item.status === "active"
          ? { href: `/v1/users/${item.id}/deactivate`, method: "PATCH" }
          : null,
    }),
  })
  async findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: "Criar turma" })
  async create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Patch(":id/activate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @ApiOperation({ summary: "Ativar turma" })
  @ApiNoContentResponse({ description: "Turma ativada" })
  @ApiNotFoundResponse({ description: "Turma não encontrada" })
  async activate(@Param("id") id: string) {
    return this.userService.changeStatus(id, UserStatus.ACTIVE);
  }

  @Patch(":id/deactivate")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Public()
  @ApiOperation({ summary: "Desativar turma" })
  @ApiNoContentResponse({ description: "Turma desativada" })
  @ApiNotFoundResponse({ description: "Turma não encontrada" })
  async deactivate(@Param("id") id: string) {
    return this.userService.changeStatus(id, UserStatus.INACTIVE);
  }
}
