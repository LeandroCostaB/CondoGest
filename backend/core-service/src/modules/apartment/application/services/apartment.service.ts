import { ApartmentDto } from "@apartment/application/dto/apartment.dto";
import { CreateApartmentDto } from "@apartment/application/dto/create-apartment.dto";
import { UpdateApartmentDto } from "@apartment/application/dto/update-apartment.dto";
import { Apartment } from "@apartment/domain/models/apartment.entity";
import {
  APARTMENT_REPOSITORY,
  type ApartmentRepository,
} from "@apartment/domain/repositories/apartment-repository.interface";
import {
  CONDOMINIUM_REPOSITORY,
  type CondominiumRepository,
} from "@condominium/domain/repositories/condominium-repository.interface";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";
import { MessagingService } from "@messaging/application/services/messaging.service";

@Injectable()
export class ApartmentService {
  constructor(
    @Inject(APARTMENT_REPOSITORY)
    private readonly apartmentRepository: ApartmentRepository,
    @Inject(CONDOMINIUM_REPOSITORY)
    private readonly condominiumRepository: CondominiumRepository,
    private readonly messagingService: MessagingService,
  ) {}

  async create(
    condominiumId: string,
    dto: CreateApartmentDto,
    userId: string,
  ): Promise<ApartmentDto> {
    await this.ensureOwnedCondominium(condominiumId, userId);
    await this.ensureUniqueApartment(condominiumId, dto.number, dto.block);

    const apartment = Apartment.restore({
      number: dto.number,
      block: dto.block?.trim() || null,
      floor: dto.floor ?? null,
      condominiumId,
    });

    const created = await this.apartmentRepository.create(apartment!);

    await this.messagingService.publishCoreEvent('apartamento.criado', {
      id: created.id,
      number: created.number,
      block: created.block ?? null,
      floor: created.floor ?? null,
      condominiumId: created.condominiumId,
    });

    return ApartmentDto.from(created)!;
  }

  async listByCondominium(
    condominiumId: string,
    userId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<ApartmentDto>> {
    await this.ensureOwnedCondominium(condominiumId, userId);

    const { rows, total } =
      await this.apartmentRepository.findAllByCondominiumIdPaginated(
        condominiumId,
        params,
      );

    return {
      data: rows.map((apartment) => ApartmentDto.from(apartment)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(
    condominiumId: string,
    apartmentId: string,
    userId: string,
  ): Promise<ApartmentDto> {
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
    if (
      dto.number === undefined &&
      dto.block === undefined &&
      dto.floor === undefined
    ) {
      throw new BadRequestException(
        "At least one field must be provided for update",
      );
    }

    await this.ensureOwnedCondominium(condominiumId, userId);

    const apartment = await this.findApartment(condominiumId, apartmentId);

    const nextNumber = dto.number ?? apartment.number;
    const nextBlock =
      dto.block !== undefined ? dto.block.trim() || null : apartment.block;

    if (nextNumber !== apartment.number || nextBlock !== apartment.block) {
      await this.ensureUniqueApartment(
        condominiumId,
        nextNumber,
        nextBlock,
        apartment.id,
      );
    }

    if (dto.number !== undefined) apartment.withNumber(dto.number);
    if (dto.block !== undefined) apartment.withBlock(nextBlock);
    if (dto.floor !== undefined) apartment.withFloor(dto.floor);

    await this.apartmentRepository.update(apartment);

    await this.messagingService.publishCoreEvent('apartamento.atualizado', {
      id: apartment.id,
      number: apartment.number,
      block: apartment.block ?? null,
      floor: apartment.floor ?? null,
      condominiumId: apartment.condominiumId,
    });
  }

  async delete(
    condominiumId: string,
    apartmentId: string,
    userId: string,
  ): Promise<void> {
    await this.ensureOwnedCondominium(condominiumId, userId);
    await this.findApartment(condominiumId, apartmentId);
    await this.apartmentRepository.delete(apartmentId);

    await this.messagingService.publishCoreEvent('apartamento.deletado', { id: apartmentId });
  }

  async assignResident(
    condominiumId: string,
    apartmentId: string,
    residentUserId: string | null,
    requestingUserId: string,
  ): Promise<ApartmentDto> {
    await this.ensureOwnedCondominium(condominiumId, requestingUserId);
    const apartment = await this.findApartment(condominiumId, apartmentId);
    await this.apartmentRepository.assignResident(apartment.id!, residentUserId);
    apartment.withUserId(residentUserId);
    return ApartmentDto.from(apartment)!;
  }

  private async ensureOwnedCondominium(
    condominiumId: string,
    userId: string,
  ): Promise<void> {
    const condominium =
      await this.condominiumRepository.findById(condominiumId);

    if (!condominium || condominium.userId !== userId) {
      throw new NotFoundException("Condominium not found");
    }
  }

  private async findApartment(
    condominiumId: string,
    apartmentId: string,
  ): Promise<Apartment> {
    const apartment = await this.apartmentRepository.findByIdAndCondominiumId(
      apartmentId,
      condominiumId,
    );

    if (!apartment) {
      throw new NotFoundException("Apartment not found");
    }

    return apartment;
  }

  private async ensureUniqueApartment(
    condominiumId: string,
    number: string,
    block?: string | null,
    apartmentIdToIgnore?: string,
  ): Promise<void> {
    const existing = await this.apartmentRepository.findByNumberAndBlock(
      condominiumId,
      number,
      block?.trim() || null,
    );

    if (existing && existing.id !== apartmentIdToIgnore) {
      throw new ConflictException(
        "An apartment with this number and block already exists in the condominium",
      );
    }
  }
}
