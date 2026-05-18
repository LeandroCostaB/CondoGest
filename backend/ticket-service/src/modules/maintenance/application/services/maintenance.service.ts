import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MAINTENANCE_REPOSITORY,
  type MaintenanceRepository,
} from '../../domain/repositories/maintenance-repository.interface';
import {
  PROVIDER_REPOSITORY,
  type ProviderRepository,
} from '../../../provider/domain/repositories/provider-repository.interface';
import { Maintenance, MaintenanceStatus } from '../../domain/models/maintenance.entity';
import { MaintenanceDto } from '../dto/maintenance.dto';

import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from '../dto/update-maintenance.dto';
import { MessagingService } from '../../../messaging/application/services/messaging.service';

const MAINTENANCE_EXCHANGE = 'condogest.maintenance';
const MAINTENANCE_COMPLETED_KEY = 'manutencao.concluida';

@Injectable()
export class MaintenanceService {
  constructor(
    @Inject(MAINTENANCE_REPOSITORY)
    private readonly maintenanceRepository: MaintenanceRepository,
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: ProviderRepository,
    private readonly messagingService: MessagingService,
  ) {}

  async create(dto: CreateMaintenanceDto): Promise<MaintenanceDto> {
    const provider = await this.providerRepository.findById(dto.providerId);
    if (!provider) throw new NotFoundException('Prestador não encontrado');

    const maintenance = Maintenance.restore({
      ticketId: dto.ticketId,
      providerId: dto.providerId,
      status: MaintenanceStatus.SCHEDULED,
      value: dto.value,
      executionDate: new Date(dto.executionDate),
    });

    const created = await this.maintenanceRepository.create(maintenance!);

    return MaintenanceDto.from(created)!;
  }

  async findAll(): Promise<MaintenanceDto[]> {
    const maintenances = await this.maintenanceRepository.findAll();
    return maintenances.map((m) => MaintenanceDto.from(m)!);
  }

  async findById(id: string): Promise<MaintenanceDto> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundException('Manutenção não encontrada');
    return MaintenanceDto.from(maintenance)!;
  }

  async findByTicketId(ticketId: string): Promise<MaintenanceDto[]> {
    const maintenances = await this.maintenanceRepository.findByTicketId(ticketId);
    return maintenances.map((m) => MaintenanceDto.from(m)!);
  }

  async update(id: string, dto: UpdateMaintenanceDto): Promise<void> {
    if (!dto.providerId && !dto.status && dto.value === undefined && !dto.executionDate) {
      throw new BadRequestException('Ao menos um campo deve ser informado para atualização');
    }

    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundException('Manutenção não encontrada');

    const oldStatus = maintenance.status;

    if (dto.providerId) {
      const provider = await this.providerRepository.findById(dto.providerId);
      if (!provider) throw new NotFoundException('Prestador não encontrado');
      maintenance.withProviderId(dto.providerId);
    }

    if (dto.status) maintenance.withStatus(dto.status);
    if (dto.value !== undefined) maintenance.withValue(dto.value);
    if (dto.executionDate) maintenance.withExecutionDate(new Date(dto.executionDate));

    await this.maintenanceRepository.update(maintenance);

    if (dto.status === MaintenanceStatus.COMPLETED && oldStatus !== MaintenanceStatus.COMPLETED) {
      await this.messagingService.publish(MAINTENANCE_EXCHANGE, MAINTENANCE_COMPLETED_KEY, {
        maintenanceId: maintenance.id,
        ticketId: maintenance.ticketId,
        providerId: maintenance.providerId,
        value: maintenance.value,
        completedAt: new Date().toISOString(),
      });
    }
  }

  async delete(id: string): Promise<void> {
    const maintenance = await this.maintenanceRepository.findById(id);
    if (!maintenance) throw new NotFoundException('Manutenção não encontrada');
    await this.maintenanceRepository.delete(id);
  }
}
