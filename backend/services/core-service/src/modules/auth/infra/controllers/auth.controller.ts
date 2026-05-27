import { CreateResidentDto } from "@auth/application/dto/create-resident.dto";
import { LoginDto } from "@auth/application/dto/login.dto";
import { RegisterDto } from "@auth/application/dto/register.dto";
import { AuthService } from "@auth/application/services/auth.service";
import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { Public } from "@shared/infra/decorators/public.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { Permission } from "@shared/domain/enums/permission.enum";

@ApiTags("auth")
@ApiBearerAuth()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @Public()
  @ApiOperation({ summary: "Registrar novo usuário" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Autenticar usuário e obter JWT" })
  @ApiUnauthorizedResponse({ description: "E-mail ou senha incorretos" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("residents")
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: "Criar morador com senha temporária (somente SINDICO)" })
  @ApiForbiddenResponse({ description: "Apenas o síndico pode criar moradores" })
  createResident(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateResidentDto,
  ) {
    return this.authService.createResident(user.sub, dto);
  }

  @Get("me")
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: "Retorna dados do usuário autenticado" })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
