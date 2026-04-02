import { UserDto } from "@user/application/dto/user.dto";
import {
  User,
  UserStatus,
} from "@user/domain/models/user.entity";
import {
  USER_REPOSITORY,
  type UserRepository,
} from "@user/domain/repositories/user-repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly UserRepository: UserRepository,
  ) {}

  async create(dto: {
    startDate: Date;
    endDate: Date;
  }): Promise<void> {
    const user = User.restore({
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: UserStatus.ACTIVE,
    });

    await this.UserRepository.create(user!);
  }

  async list(): Promise<UserDto[]> {
    const response = await this.UserRepository.findAll();
    return response.map((row) => UserDto.from(row)!);
  }

  async listPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<UserDto>> {
    const { rows, total } =
      await this.UserRepository.findAllPaginated(params);
    return {
      data: rows.map((row) => UserDto.from(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<UserDto | null> {
    const response = await this.UserRepository.findById(id);
    return UserDto.from(response);
  }

  async changeStatus(id: string, status: UserStatus): Promise<void> {
    const User = await this.UserRepository.findById(id);

    if (!User) {
      throw new NotFoundException("User not found");
    }

    await this.UserRepository.updateStatus(id, status);
  }
}
