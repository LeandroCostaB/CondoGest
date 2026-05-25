import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards // <-- Importado aqui
} from '@nestjs/common';
import { AuthService } from '@user/application/services/auth.service';
import { UserService } from '@user/application/services/user.service';
import { Public } from '@shared/infra/decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from '@shared/infra/decorators/current-user.decorator';
import { RequirePermissions } from '@shared/infra/decorators/permissions.decorator';
import { Permission } from '@shared/domain/enums/permission.enum';
import { JwtAuthGuard } from '@shared/infra/guards/jwt-auth.guard'; // <-- Importado aqui
import { UpdateFcmTokenDto } from '@user/application/dto/update-fcm-token.dto'; // <-- Importado aqui

@Controller('auth')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) { }

  @Public()
  @Post('register')
  register(@Body() data: any) {
    return this.authService.register(data);
  }

  @Public()
  @Post('login')
  async login(@Body() data: any) {
    return this.authService.login(data.email, data.senha);
  }

  // Rota para o usuário logado ver os próprios dados
  @Get('me')
  @RequirePermissions(Permission.USERS_READ)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  // Listar todos os usuários (Ex: Síndico vendo lista de moradores)
  @Get('list')
  @RequirePermissions(Permission.USERS_READ)
  findAll() {
    return this.userService.findAll();
  }

  // Editar usuário 
  @Patch(':id')
  @RequirePermissions(Permission.USERS_WRITE)
  update(@Param('id') id: string, @Body() data: any) {
    return this.userService.update(id, data);
  }

  // Deletar usuário (Ex: Morador que saiu do prédio)
  @Delete(':id')
  @RequirePermissions(Permission.USERS_DELETE)
  remove(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  // Atualizar Token FCM
  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard) 
  async updateToken(
    @CurrentUser() user: AuthenticatedUser, 
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
  ) {
    return this.userService.updateFcmToken(user.id, updateFcmTokenDto.token);
  }
}