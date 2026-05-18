import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@user/domain/repositories/user-repository.interface';
import { UserDto } from '@user/application/dto/user.dto';
import { MessagingService } from '@messaging/application/services/messaging.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly messagingService: MessagingService,
  ) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => UserDto.from(u)!);
  }

  async update(id: string, data: { nome?: string; email?: string; senha?: string }): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    if (data.nome) user.withNome(data.nome);
    if (data.email) user.withEmail(data.email);
    if (data.senha) {
      const salt = await bcrypt.genSalt(10);
      user.withSenha(await bcrypt.hash(data.senha, salt));
    }

    const updated = await this.userRepository.update(user);

    await this.messagingService.publishCoreEvent('morador.atualizado', {
      id: updated.id,
      nome: updated.nome,
      email: updated.email,
      role: updated.role,
    });

    return UserDto.from(updated)!;
  }

  async delete(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.userRepository.delete(id);

    await this.messagingService.publishCoreEvent('morador.deletado', { id });

    return { message: 'Usuário removido com sucesso' };
  }
  
  async updateFcmToken(userId: string, token: string): Promise<void> {
    await db
      .update(users)
      .set({ fcmToken: token, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
