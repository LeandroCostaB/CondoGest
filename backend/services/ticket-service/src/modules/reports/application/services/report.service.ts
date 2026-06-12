import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateReportDto } from "@reports/application/dto/create-report.dto";
import { ReportDto } from "@reports/application/dto/report.dto";
import {
  Report,
  ReportStatus,
  ReportType,
} from "@reports/domain/models/report.entity";
import {
  REPORT_REPOSITORY,
  type ReportRepository,
} from "@reports/domain/repositories/report-repository.interface";
import type { PaginatedResult } from "@shared/infra/hateoas";
import { DashboardStatisticsService } from "./dashboard-statistics.service";

@Injectable()
export class ReportService {
  constructor(
    @Inject(REPORT_REPOSITORY)
    private readonly reportRepository: ReportRepository,
    private readonly dashboardStatisticsService: DashboardStatisticsService,
  ) {}

  async createMonthlyReport(dto: CreateReportDto): Promise<ReportDto> {
    if (dto.type !== ReportType.MONTHLY) {
      throw new BadRequestException("Tipo de relatório inválido");
    }

    if (!dto.month || !dto.year) {
      throw new BadRequestException(
        "Mês e ano são obrigatórios para relatórios mensais",
      );
    }

    // Verificar se relatório já existe para o mês
    const existing = await this.reportRepository.findByCondominiumIdAndMonth(
      dto.condominiumId,
      dto.month,
      dto.year,
    );

    if (existing) {
      throw new BadRequestException(
        `Relatório já existe para ${dto.month}/${dto.year}`,
      );
    }

    // Gerar dados do relatório
    const statistics = await this.dashboardStatisticsService.getStatistics(
      dto.condominiumId,
    );

    const report = Report.restore({
      condominiumId: dto.condominiumId,
      type: ReportType.MONTHLY,
      status: ReportStatus.GENERATED,
      month: dto.month,
      year: dto.year,
      data: statistics as unknown as Record<string, unknown>,
    })!;

    const created = await this.reportRepository.create(report);
    return ReportDto.from(created)!;
  }

  async createCustomReport(dto: CreateReportDto): Promise<ReportDto> {
    if (dto.type !== ReportType.CUSTOM) {
      throw new BadRequestException("Tipo de relatório inválido");
    }

    if (!dto.startDate || !dto.endDate) {
      throw new BadRequestException(
        "Data inicial e final são obrigatórias para relatórios customizados",
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException(
        "Data inicial não pode ser maior que data final",
      );
    }

    // Gerar dados do relatório
    const statistics = await this.dashboardStatisticsService.getStatistics(
      dto.condominiumId,
    );

    const report = Report.restore({
      condominiumId: dto.condominiumId,
      type: ReportType.CUSTOM,
      status: ReportStatus.GENERATED,
      startDate,
      endDate,
      data: statistics as unknown as Record<string, unknown>,
    })!;

    const created = await this.reportRepository.create(report);
    return ReportDto.from(created)!;
  }

  async listPaginated(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<ReportDto>> {
    const all = await this.reportRepository.findAll();
    const total = all.length;
    const data = all
      .slice((page - 1) * limit, page * limit)
      .map((r) => ReportDto.from(r)!);
    return { data, total, page, limit };
  }

  async findById(id: string): Promise<ReportDto> {
    const report = await this.reportRepository.findById(id);
    if (!report) throw new NotFoundException("Relatório não encontrado");
    return ReportDto.from(report)!;
  }

  async findByCondominiumId(condominiumId: string): Promise<ReportDto[]> {
    const reports =
      await this.reportRepository.findByCondominiumId(condominiumId);
    return reports.map((r) => ReportDto.from(r)!);
  }

  async markAsExported(id: string): Promise<void> {
    const report = await this.reportRepository.findById(id);
    if (!report) throw new NotFoundException("Relatório não encontrado");

    report.withStatus(ReportStatus.EXPORTED);
    await this.reportRepository.update(report);
  }

  async delete(id: string): Promise<void> {
    const report = await this.reportRepository.findById(id);
    if (!report) throw new NotFoundException("Relatório não encontrado");
    await this.reportRepository.delete(id);
  }
}
