import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthService } from '@user/application/services/auth.service';
import { UserService } from '@user/application/services/user.service';
import { LoginDto } from '@user/application/dto/login.dto';
import { RegisterDto } from '@user/application/dto/register.dto';
import { UserDto } from '@user/application/dto/user.dto';
import { Public } from '@shared/infra/decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from '@shared/infra/decorators/current-user.decorator';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';

@ApiTags('auth')
@ApiBearerAuth('JWT')
@Controller('auth')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Criar conta' })
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso' })
  @ApiConflictResponse({ description: 'E-mail já está em uso' })
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Autenticar e obter token JWT' })
  @ApiOkResponse({ description: 'Login realizado, token retornado' })
  @ApiUnauthorizedResponse({ description: 'E-mail ou senha incorretos' })
  async login(@Body() data: LoginDto) {
    return this.authService.login(data.email, data.senha);
  }

  @Get('me')
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  @ApiOkResponse({ description: 'Dados do usuário logado', type: UserDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @RequirePermissions(Permission.USERS_READ)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Get('list')
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiOkResponse({ description: 'Lista de usuários', type: [UserDto] })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @RequirePermissions(Permission.USERS_READ)
  findAll() {
    return this.userService.findAll();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiOkResponse({ description: 'Usuário atualizado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @RequirePermissions(Permission.USERS_WRITE)
  update(@Param('id') id: string, @Body() data: any) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir usuário' })
  @ApiNoContentResponse({ description: 'Usuário excluído' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiForbiddenResponse({ description: 'Sem permissão' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @RequirePermissions(Permission.USERS_DELETE)
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
