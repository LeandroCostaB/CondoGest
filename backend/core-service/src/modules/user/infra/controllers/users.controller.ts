import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { Permission } from "@shared/domain/enums/permission.enum";
import {
  type AuthenticatedUser,
  CurrentUser,
} from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { Public } from "@shared/infra/decorators/public.decorator";
import { CreateUserDto, UpdateUserDto } from "@user/application/dto/user.dto";
import { AuthService } from "@user/application/services/auth.service";
import { UserService } from "@user/application/services/user.service";

@Controller("users")
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post("register")
  register(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @Public()
  @Post("login")
  async login(@Body() data: { email: string; senha: string }) {
    return this.authService.login(data.email, data.senha);
  }

  @Get("me")
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Get()
  @RequirePermissions(Permission.USERS_READ)
  findAll() {
    return this.userService.list();
  }

  @Get(":id")
  @RequirePermissions(Permission.USERS_READ)
  findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  @Put(":id")
  @RequirePermissions(Permission.USERS_WRITE)
  update(@Param("id") id: string, @Body() data: UpdateUserDto) {
    return this.userService.edit(id, data);
  }

  @Delete(":id")
  @RequirePermissions(Permission.USERS_DELETE)
  remove(@Param("id") id: string) {
    return this.userService.remove(id);
  }
}
