import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
} from "@user/application/dto/user.dto";
import { User, UserType } from "@user/domain/models/user.entity";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "@user/domain/repositories/user-repository.interface";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<void> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException("Email já cadastrado");

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = User.restore({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash: passwordHash,
      type: dto.type || UserType.MORADOR,
    })!;

    await this.userRepository.create(user);
  }

  async edit(id: string, dto: UpdateUserDto): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException("Usuário não encontrado");

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findByEmail(dto.email);
      if (existing) throw new ConflictException("Email já cadastrado");
      user.withEmail(dto.email.toLowerCase());
    }

    if (dto.name) user.withName(dto.name);
    if (dto.type) user.withType(dto.type);

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(dto.password, salt);
      user.withPasswordHash(passwordHash);
    }

    await this.userRepository.update(user);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async list(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((u) => UserResponseDto.from(u)!);
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findById(id);
    return UserResponseDto.from(user);
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return user;
  }
}
