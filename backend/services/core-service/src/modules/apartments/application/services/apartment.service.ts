import { ApartmentDto } from "@apartments/application/dto/apartment.dto";
import type { CreateApartmentDto } from "@apartments/application/dto/create-apartment.dto";
import type { UpdateApartmentDto } from "@apartments/application/dto/update-apartment.dto";
import { ApartmentMessagingService } from "@apartments/application/services/apartment-messaging.service";
import { Apartment } from "@apartments/domain/models/apartment.entity";
import {
  APARTMENT_REPOSITORY,
  type ApartmentRepository,
} from "@apartments/domain/repositories/apartment-repository.interface";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CONDOMINIUM_REPOSITORY,
  type CondominiumRepository,
} from "@condominiums/domain/repositories/condominium-repository.interface";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class ApartmentService {
  constructor(
    @Inject(APARTMENT_REPOSITORY)
    private readonly apartmentRepository: ApartmentRepository,
    @Inject(CONDOMINIUM_REPOSITORY)
    private readonly condominiumRepository: CondominiumRepository,
    private readonly messagingService: ApartmentMessagingService,
  ) {}

  async create(condominiumId: string, dto: CreateApartmentDto, userId: string): Promise<void> {
    await this.ensureOwnedCondominium(condominiumId, userId);
    await this.ensureUniqueApartment(condominiumId, dto.number, dto.block);

    const apartment = Apartment.restore({
      number: dto.number,
      block: dto.block?.trim() || null,
      floor: dto.floor ?? null,
      condominiumId,
    });

    const created = await this.apartmentRepository.create(apartment!);
    await this.messagingService.publishApartmentCreated(ApartmentDto.from(created)!);
  }

  async listByCondominium(
    condominiumId: string,
    userId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<ApartmentDto>> {
    await this.ensureOwnedCondominium(condominiumId, userId);
    const { rows, total } = await this.apartmentRepository.findAllByCondominiumIdPaginated(condominiumId, params);
    return {
      data: rows.map((a) => ApartmentDto.from(a)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(condominiumId: string, apartmentId: string, userId: string): Promise<ApartmentDto> {
    await this.ensureOwnedCondominium(condominiumId, userId);
    const apartment = await this.findApartment(condominiumId, apartmentId);
    return ApartmentDto.from(apartment)!;
  }

  async update(
    condominiumId: string,
    apartmentId: string,
    dto: UpdateApartmentDto,
    userId: string,
  ): Promise<void> {
    if (dto.number === undefined && dto.block === undefined && dto.floor === undefined) {
      throw new BadRequestException("Ao menos um campo deve ser informado para atualização");
    }

    await this.ensureOwnedCondominium(condominiumId, userId);
    const apartment = await this.findApartment(condominiumId, apartmentId);

    const nextNumber = dto.number ?? apartment.number;
    const nextBlock = dto.block !== undefined ? dto.block.trim() || null : apartment.block;

    if (nextNumber !== apartment.number || nextBlock !== apartment.block) {
      await this.ensureUniqueApartment(condominiumId, nextNumber, nextBlock, apartment.id);
    }

    if (dto.number !== undefined) apartment.withNumber(dto.number);
    if (dto.block !== undefined) apartment.withBlock(nextBlock);
    if (dto.floor !== undefined) apartment.withFloor(dto.floor);

    await this.apartmentRepository.update(apartment);
    await this.messagingService.publishApartmentUpdated(ApartmentDto.from(apartment)!);
  }

  async assignResident(
    condominiumId: string,
    apartmentId: string,
    residentId: string | null,
    userId: string,
  ): Promise<void> {
    await this.ensureOwnedCondominium(condominiumId, userId);
    await this.findApartment(condominiumId, apartmentId);
    await this.apartmentRepository.assignResident(apartmentId, residentId);
  }

  async delete(condominiumId: string, apartmentId: string, userId: string): Promise<void> {
    await this.ensureOwnedCondominium(condominiumId, userId);
    await this.findApartment(condominiumId, apartmentId);
    await this.apartmentRepository.delete(apartmentId);
    await this.messagingService.publishApartmentDeleted(apartmentId);
  }

  private async ensureOwnedCondominium(condominiumId: string, userId: string): Promise<void> {
    const condominium = await this.condominiumRepository.findById(condominiumId);
    if (!condominium || condominium.userId !== userId) {
      throw new NotFoundException("Condomínio não encontrado");
    }
  }

  private async findApartment(condominiumId: string, apartmentId: string): Promise<Apartment> {
    const apartment = await this.apartmentRepository.findByIdAndCondominiumId(apartmentId, condominiumId);
    if (!apartment) throw new NotFoundException("Apartamento não encontrado");
    return apartment;
  }

  private async ensureUniqueApartment(
    condominiumId: string,
    number: string,
    block?: string | null,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.apartmentRepository.findByNumberAndBlock(
      condominiumId,
      number,
      block?.trim() || null,
    );
    if (existing && existing.id !== excludeId) {
      throw new ConflictException("Já existe um apartamento com este número e bloco neste condomínio");
    }
  }
}
