import { CondominiumDto } from "@condominium/application/dto/condominium.dto";
import { CreateCondominiumDto } from "@condominium/application/dto/create-condominium.dto";
import { UpdateCondominiumDto } from "@condominium/application/dto/update-condominium.dto";
import {
  Condominium,
  CondominiumStatus,
} from "@condominium/domain/models/condominium.entity";
import {
  CONDOMINIUM_REPOSITORY,
  type CondominiumRepository,
} from "@condominium/domain/repositories/condominium-repository.interface";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";
import { MessagingService } from "@messaging/application/services/messaging.service";

@Injectable()
export class CondominiumService {
  constructor(
    @Inject(CONDOMINIUM_REPOSITORY)
    private readonly condominiumRepository: CondominiumRepository,
    private readonly messagingService: MessagingService,
  ) {}

  async create(dto: CreateCondominiumDto, userId: string): Promise<void> {
    const condominium = Condominium.restore({
      name: dto.name,
      address: dto.address,
      userId,
      status: CondominiumStatus.ACTIVE,
    });

    const created = await this.condominiumRepository.create(condominium!);

    await this.messagingService.publishCoreEvent('condominio.criado', {
      id: created.id,
      name: created.name,
      address: created.address,
      status: created.status,
    });
  }

  async listByUser(userId: string): Promise<CondominiumDto[]> {
    const response = await this.condominiumRepository.findAllByUserId(userId);
    return response.map((row) => CondominiumDto.from(row)!);
  }

  async listByUserPaginated(
    userId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<CondominiumDto>> {
    const { rows, total } =
      await this.condominiumRepository.findAllByUserIdPaginated(userId, params);
    return {
      data: rows.map((row) => CondominiumDto.from(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<CondominiumDto> {
    const response = await this.condominiumRepository.findById(id);

    if (!response) {
      throw new NotFoundException("Condominium not found");
    }

    return CondominiumDto.from(response)!;
  }

  async findByIdForUser(id: string, userId: string): Promise<CondominiumDto> {
    const condominium = await this.findOwnedCondominium(id, userId);
    return CondominiumDto.from(condominium)!;
  }

  async update(
    id: string,
    dto: UpdateCondominiumDto,
    userId: string,
  ): Promise<void> {
    if (dto.name === undefined && dto.address === undefined) {
      throw new BadRequestException(
        "At least one field must be provided for update",
      );
    }

    const condominium = await this.findOwnedCondominium(id, userId);

    if (dto.name !== undefined) condominium.withName(dto.name);
    if (dto.address !== undefined) condominium.withAddress(dto.address);

    await this.condominiumRepository.update(condominium);

    await this.messagingService.publishCoreEvent('condominio.atualizado', {
      id: condominium.id,
      name: condominium.name,
      address: condominium.address,
      status: condominium.status,
    });
  }

  async changeStatus(
    id: string,
    status: CondominiumStatus,
    userId: string,
  ): Promise<void> {
    const condominium = await this.findOwnedCondominium(id, userId);
    await this.condominiumRepository.updateStatus(id, status);

    await this.messagingService.publishCoreEvent('condominio.atualizado', {
      id: condominium.id,
      name: condominium.name,
      address: condominium.address,
      status,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOwnedCondominium(id, userId);
    await this.condominiumRepository.delete(id);

    await this.messagingService.publishCoreEvent('condominio.deletado', { id });
  }

  private async findOwnedCondominium(
    id: string,
    userId: string,
  ): Promise<Condominium> {
    const condominium = await this.condominiumRepository.findById(id);

    if (!condominium || condominium.userId !== userId) {
      throw new NotFoundException("Condominium not found");
    }

    return condominium;
  }
}
