import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '@user/application/services/auth.service';
import { UserService } from '@user/application/services/user.service';
import { Public } from '@shared/infra/decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from '@shared/infra/decorators/current-user.decorator';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';
import { JwtAuthGuard } from '@shared/infra/guards/jwt-auth.guard';
import { LoginDto } from '@user/application/dto/login.dto';
import { RegisterDto } from '@user/application/dto/register.dto';
import { UpdateUserDto } from '@user/application/dto/update-user.dto';
import { UpdateFcmTokenDto } from '@user/application/dto/update-fcm-token.dto';
import { CreateResidentDto } from '@user/application/dto/create-resident.dto';
import { UserDto } from '@user/application/dto/user.dto';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já está em uso.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e obter JWT' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido. Retorna access_token.' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha incorretos.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.senha);
  }

  @Post('residents')
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Criar morador e enviar e-mail com senha temporária (somente SINDICO)' })
  @ApiResponse({ status: 201, description: 'Morador criado e notificação enviada.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Apenas o síndico pode criar moradores.' })
  createResident(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateResidentDto,
  ) {
    return this.authService.createResident(user.sub, dto);
  }

  @Get('me')
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'Retorna os dados do usuário autenticado' })
  @ApiResponse({ status: 200 })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Get('list')
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, type: [UserDto] })
  findAll() {
    return this.userService.findAll();
  }

  // Rota específica ANTES de :id para evitar shadowing
  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar token FCM do usuário autenticado' })
  @ApiResponse({ status: 200 })
  updateFcmToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateFcmTokenDto,
  ) {
    return this.userService.updateFcmToken(user.sub, dto.token);
  }

  @Patch(':id')
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Atualizar dados de um usuário' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permission.USERS_DELETE)
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
