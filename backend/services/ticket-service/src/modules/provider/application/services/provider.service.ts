import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PROVIDER_REPOSITORY,
  type ProviderRepository,
} from '../../domain/repositories/provider-repository.interface';
import { Provider } from '../../domain/models/provider.entity';
import { ProviderDto } from '../dto/provider.dto';
import { CreateProviderDto } from '../dto/create-provider.dto';
import { UpdateProviderDto } from '../dto/update-provider.dto';

@Injectable()
export class ProviderService {
  constructor(
    @Inject(PROVIDER_REPOSITORY)
    private readonly providerRepository: ProviderRepository,
  ) {}

  async create(dto: CreateProviderDto): Promise<ProviderDto> {
    const provider = Provider.restore({
      name: dto.name,
      phone: dto.phone,
      specialty: dto.specialty,
    });
    const created = await this.providerRepository.create(provider!);
    return ProviderDto.from(created)!;
  }

  async findAll(): Promise<ProviderDto[]> {
    const providers = await this.providerRepository.findAll();
    return providers.map((p) => ProviderDto.from(p)!);
  }

  async findById(id: string): Promise<ProviderDto> {
    const provider = await this.providerRepository.findById(id);
    if (!provider) throw new NotFoundException('Prestador não encontrado');
    return ProviderDto.from(provider)!;
  }

  async update(id: string, dto: UpdateProviderDto): Promise<void> {
    if (!dto.name && !dto.phone && !dto.specialty) {
      throw new BadRequestException('Ao menos um campo deve ser informado para atualização');
    }
    const provider = await this.providerRepository.findById(id);
    if (!provider) throw new NotFoundException('Prestador não encontrado');
    if (dto.name) provider.withName(dto.name);
    if (dto.phone) provider.withPhone(dto.phone);
    if (dto.specialty) provider.withSpecialty(dto.specialty);
    await this.providerRepository.update(provider);
  }

  async delete(id: string): Promise<void> {
    const provider = await this.providerRepository.findById(id);
    if (!provider) throw new NotFoundException('Prestador não encontrado');
    await this.providerRepository.delete(id);
  }
}
