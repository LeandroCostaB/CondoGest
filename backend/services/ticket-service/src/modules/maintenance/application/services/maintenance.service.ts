import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { MAINTENANCE_REPOSITORY, type MaintenanceRepository } from "@maintenance/domain/repositories/maintenance-repository.interface";
import { PROVIDER_REPOSITORY, type ProviderRepository } from "@providers/domain/repositories/provider-repository.interface";
import { Maintenance, MaintenanceStatus } from "@maintenance/domain/models/maintenance.entity";
import { MaintenanceDto } from "@maintenance/application/dto/maintenance.dto";
import type { CreateMaintenanceDto } from "@maintenance/application/dto/create-maintenance.dto";
import type { UpdateMaintenanceDto } from "@maintenance/application/dto/update-maintenance.dto";
import { MaintenanceMessagingService } from "@maintenance/application/services/maintenance-messaging.service";
import type { PaginatedResult } from "@shared/infra/hateoas";

@Injectable()
export class MaintenanceService {
  constructor(
    @Inject(MAINTENANCE_REPOSITORY)
    private readonly maintenanceRepository: MaintenanceRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: ProviderRepository,
    private readonly maintenanceMessagingService: MaintenanceMessagingService,
  ) {}

  async create(dto: CreateMaintenanceDto): Promise<MaintenanceDto> {
    if (dto.providerId) {
      const provider = await this.providerRepository.findById(dto.providerId);
      if (!provider) throw new NotFoundException("Prestador não encontrado");
    }

    const maintenance = Maintenance.restore({
      ticketId: dto.ticketId ?? null,
      apartmentId: dto.apartmentId ?? null,
      condominiumId: dto.condominiumId ?? null,
      providerId: dto.providerId ?? null,
      status: MaintenanceStatus.SCHEDULED,
      value: dto.value ?? 0,
      executionDate: dto.executionDate ? new Date(dto.executionDate) : new Date(),
      type: dto.type ?? null,
      local: dto.local ?? null,
      priority: dto.priority ?? null,
      providerName: dto.providerName ?? null,
      providerContact: dto.providerContact ?? null,
      observation: dto.observation ?? null,
    })!;

    const created = await this.maintenanceRepository.create(maintenance);
    const createdDto = MaintenanceDto.from(created)!;

    if (dto.executionDate) {
      await this.maintenanceMessagingService.publishMaintenanceScheduled(createdDto).catch(() => undefined);
    }

    return createdDto;
  }

  async listPaginated(page = 1, limit = 10): Promise<PaginatedResult<MaintenanceDto>> {
    const all = await this.maintenanceRepository.findAll();
    const total = all.length;
    const data = all.slice((page - 1) * limit, page * limit).map((m) => MaintenanceDto.from(m)!);
    return { data, total, page, limit };
  }

  async findById(id: string): Promise<MaintenanceDto> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundException("Manutenção não encontrada");
    return MaintenanceDto.from(maintenance)!;
  }

  async findByTicketId(ticketId: string): Promise<MaintenanceDto[]> {
    const items = await this.maintenanceRepository.findByTicketId(ticketId);
    return items.map((m) => MaintenanceDto.from(m)!);
  }

  async findByApartmentId(apartmentId: string): Promise<MaintenanceDto[]> {
    const items = await this.maintenanceRepository.findByApartmentId(apartmentId);
    return items.map((m) => MaintenanceDto.from(m)!);
  }

  async findByCondominiumId(condominiumId: string): Promise<MaintenanceDto[]> {
    const items = await this.maintenanceRepository.findByCondominiumId(condominiumId);
    return items.map((m) => MaintenanceDto.from(m)!);
  }

  async update(id: string, dto: UpdateMaintenanceDto): Promise<void> {
    const hasAnyField =
      dto.providerId || dto.status || dto.value !== undefined || dto.executionDate ||
      dto.type !== undefined || dto.local !== undefined || dto.priority !== undefined ||
      dto.providerName !== undefined || dto.providerContact !== undefined || dto.observation !== undefined;
    if (!hasAnyField) {
      throw new BadRequestException("Ao menos um campo deve ser informado para atualização");
    }

    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundException("Manutenção não encontrada");

    const oldStatus = maintenance.status;

    if (dto.providerId) {
      const provider = await this.providerRepository.findById(dto.providerId);
      if (!provider) throw new NotFoundException("Prestador não encontrado");
      maintenance.withProviderId(dto.providerId);
    }
    if (dto.status) maintenance.withStatus(dto.status);
    if (dto.value !== undefined) maintenance.withValue(dto.value);
    if (dto.executionDate) maintenance.withExecutionDate(new Date(dto.executionDate));
    if (dto.type !== undefined) maintenance.withType(dto.type ?? null);
    if (dto.local !== undefined) maintenance.withLocal(dto.local ?? null);
    if (dto.priority !== undefined) maintenance.withPriority(dto.priority ?? null);
    if (dto.providerName !== undefined) maintenance.withProviderName(dto.providerName ?? null);
    if (dto.providerContact !== undefined) maintenance.withProviderContact(dto.providerContact ?? null);
    if (dto.observation !== undefined) maintenance.withObservation(dto.observation ?? null);

    await this.maintenanceRepository.update(maintenance);

    const updatedDto = MaintenanceDto.from(maintenance)!;

    if (dto.status && dto.status !== oldStatus) {
      if (dto.status === MaintenanceStatus.COMPLETED) {
        await this.maintenanceMessagingService.publishMaintenanceCompleted(updatedDto).catch(() => undefined);
      }
      await this.maintenanceMessagingService.publishMaintenanceStatusChanged(updatedDto, oldStatus).catch(() => undefined);
    }
  }

  async delete(id: string): Promise<void> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundException("Manutenção não encontrada");
    await this.maintenanceRepository.delete(id);
  }
}
