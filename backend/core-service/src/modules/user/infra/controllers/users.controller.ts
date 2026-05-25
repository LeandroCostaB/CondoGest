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
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from '@user/application/services/auth.service';
import { UserService } from '@user/application/services/user.service';
import { Public } from '@shared/infra/decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from '@shared/infra/decorators/current-user.decorator';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';
import { JwtAuthGuard } from '@shared/infra/guards/jwt-auth.guard';
import { UpdateFcmTokenDto } from '@user/application/dto/update-fcm-token.dto';
import { CreateResidentDto } from '@user/application/dto/create-resident.dto';

@ApiTags('Autenticação e Usuários')
@ApiBearerAuth()
@Controller('auth')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) { }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário (público)' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  register(@Body() data: any) {
    return this.authService.register(data);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuário e obter JWT' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido. Retorna access_token.' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas.' })
  async login(@Body() data: any) {
    return this.authService.login(data.email, data.senha);
  }

  @Post('residents')
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Criar morador e enviar e-mail com senha temporária' })
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
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário atual.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @Get('list')
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  findAll() {
    return this.userService.findAll();
  }

  // Rota específica ANTES de :id para evitar shadowing
  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar token FCM do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Token atualizado.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  async updateToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
  ) {
    return this.userService.updateFcmToken(user.sub, updateFcmTokenDto.token);
  }

  @Patch(':id')
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Atualizar dados de um usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions(Permission.USERS_DELETE)
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Usuário não autenticado.' })
  @ApiForbiddenResponse({ description: 'Usuário sem permissão.' })
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
