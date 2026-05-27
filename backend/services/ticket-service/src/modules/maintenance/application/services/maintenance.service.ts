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
    const provider = await this.providerRepository.findById(dto.providerId);
    if (!provider) throw new NotFoundException("Prestador não encontrado");

    const maintenance = Maintenance.restore({
      ticketId: dto.ticketId,
      providerId: dto.providerId,
      status: MaintenanceStatus.SCHEDULED,
      value: dto.value,
      executionDate: new Date(dto.executionDate),
    })!;

    const created = await this.maintenanceRepository.create(maintenance);
    return MaintenanceDto.from(created)!;
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

  async update(id: string, dto: UpdateMaintenanceDto): Promise<void> {
    if (!dto.providerId && !dto.status && dto.value === undefined && !dto.executionDate) {
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

    await this.maintenanceRepository.update(maintenance);

    if (dto.status === MaintenanceStatus.COMPLETED && oldStatus !== MaintenanceStatus.COMPLETED) {
      await this.maintenanceMessagingService.publishMaintenanceCompleted(
        MaintenanceDto.from(maintenance)!,
      );
    }
  }

  async delete(id: string): Promise<void> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundException("Manutenção não encontrada");
    await this.maintenanceRepository.delete(id);
  }
}
