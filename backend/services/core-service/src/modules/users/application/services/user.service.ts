import {
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";
import { UserDto } from "@users/application/dto/user.dto";
import type { UpdateUserDto } from "@users/application/dto/update-user.dto";
import { UserMessagingService } from "@users/application/services/user-messaging.service";
import { User, type UserRole } from "@users/domain/models/user.entity";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "@users/domain/repositories/user-repository.interface";
import bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly messagingService: UserMessagingService,
  ) {}

  async createInternal(data: {
    nome: string;
    email: string;
    senha: string;
    role: UserRole;
  }): Promise<User> {
    const user = User.restore({
      nome: data.nome,
      email: data.email.toLowerCase(),
      senha: data.senha,
      role: data.role,
    });
    const created = await this.userRepository.create(user!);
    await this.messagingService.publishUserCreated(UserDto.from(created)!);
    return created;
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => UserDto.from(u)!);
  }

  async listPaginated(params: PaginationParams): Promise<PaginatedResult<UserDto>> {
    const { rows, total } = await this.userRepository.findAllPaginated(params);
    return {
      data: rows.map((u) => UserDto.from(u)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<UserDto | null> {
    const user = await this.userRepository.findById(id);
    return UserDto.from(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    if (dto.nome) user.withNome(dto.nome);
    if (dto.email) user.withEmail(dto.email.toLowerCase());
    if (dto.senha) {
      const hashed = await bcrypt.hash(dto.senha, 10);
      user.withSenha(hashed);
    }

    const updated = await this.userRepository.update(user);
    await this.messagingService.publishUserUpdated(UserDto.from(updated)!);
    return UserDto.from(updated)!;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado");
    await this.userRepository.delete(id);
    await this.messagingService.publishUserDeleted(id);
  }

  async updateFcmToken(userId: string, token: string): Promise<void> {
    await this.userRepository.updateFcmToken(userId, token);
    const user = await this.userRepository.findById(userId);
    if (user) {
      await this.messagingService.publishUserUpdated(UserDto.from(user)!);
    }
  }
}
