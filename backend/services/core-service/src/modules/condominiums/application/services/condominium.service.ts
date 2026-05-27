import { CondominiumDto } from "@condominiums/application/dto/condominium.dto";
import type { CreateCondominiumDto } from "@condominiums/application/dto/create-condominium.dto";
import type { UpdateCondominiumDto } from "@condominiums/application/dto/update-condominium.dto";
import { CondominiumMessagingService } from "@condominiums/application/services/condominium-messaging.service";
import {
  Condominium,
  CondominiumStatus,
} from "@condominiums/domain/models/condominium.entity";
import {
  CONDOMINIUM_REPOSITORY,
  type CondominiumRepository,
} from "@condominiums/domain/repositories/condominium-repository.interface";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class CondominiumService {
  constructor(
    @Inject(CONDOMINIUM_REPOSITORY)
    private readonly condominiumRepository: CondominiumRepository,
    private readonly messagingService: CondominiumMessagingService,
  ) {}

  async create(dto: CreateCondominiumDto, userId: string): Promise<void> {
    const condominium = Condominium.restore({
      name: dto.name,
      address: dto.address,
      userId,
      status: CondominiumStatus.ACTIVE,
    });
    const created = await this.condominiumRepository.create(condominium!);
    await this.messagingService.publishCondominiumCreated(CondominiumDto.from(created)!);
  }

  async listByUserPaginated(userId: string, params: PaginationParams): Promise<PaginatedResult<CondominiumDto>> {
    const { rows, total } = await this.condominiumRepository.findAllByUserIdPaginated(userId, params);
    return {
      data: rows.map((row) => CondominiumDto.from(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findByIdForUser(id: string, userId: string): Promise<CondominiumDto> {
    const condominium = await this.findOwnedCondominium(id, userId);
    return CondominiumDto.from(condominium)!;
  }

  async findById(id: string): Promise<CondominiumDto> {
    const condominium = await this.condominiumRepository.findById(id);
    if (!condominium) throw new NotFoundException("Condomínio não encontrado");
    return CondominiumDto.from(condominium)!;
  }

  async update(id: string, dto: UpdateCondominiumDto, userId: string): Promise<void> {
    if (dto.name === undefined && dto.address === undefined) {
      throw new BadRequestException("Ao menos um campo deve ser informado para atualização");
    }
    const condominium = await this.findOwnedCondominium(id, userId);
    if (dto.name !== undefined) condominium.withName(dto.name);
    if (dto.address !== undefined) condominium.withAddress(dto.address);
    await this.condominiumRepository.update(condominium);
    await this.messagingService.publishCondominiumUpdated(CondominiumDto.from(condominium)!);
  }

  async changeStatus(id: string, status: CondominiumStatus, userId: string): Promise<void> {
    const condominium = await this.findOwnedCondominium(id, userId);
    await this.condominiumRepository.updateStatus(id, status);
    await this.messagingService.publishCondominiumUpdated(
      CondominiumDto.from(condominium.withStatus(status))!,
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.findOwnedCondominium(id, userId);
    await this.condominiumRepository.delete(id);
    await this.messagingService.publishCondominiumDeleted(id);
  }

  private async findOwnedCondominium(id: string, userId: string): Promise<Condominium> {
    const condominium = await this.condominiumRepository.findById(id);
    if (!condominium || condominium.userId !== userId) {
      throw new NotFoundException("Condomínio não encontrado");
    }
    return condominium;
  }
}
