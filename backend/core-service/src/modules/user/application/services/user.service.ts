import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@user/domain/repositories/user-repository.interface';
import { UserDto } from '@user/application/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
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
    return UserDto.from(updated)!;
  }

  async delete(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado');
    await this.userRepository.delete(id);
    return { message: 'Usuário removido com sucesso' };
  }
}
