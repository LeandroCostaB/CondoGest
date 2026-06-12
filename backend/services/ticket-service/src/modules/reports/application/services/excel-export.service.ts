import { Injectable } from "@nestjs/common";
import type { ReportDto } from "@reports/application/dto/report.dto";
import { Workbook } from "exceljs";
import type { DashboardStatistics } from "./dashboard-statistics.service";

@Injectable()
export class ExcelExportService {
  async generateReportExcel(report: ReportDto): Promise<Buffer> {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Relatório");

    // Cabeçalho
    worksheet.columns = [
      { header: "Informação", key: "info", width: 30 },
      { header: "Valor", key: "value", width: 50 },
    ];

    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    // Informações do Relatório
    let rowNum = 2;
    worksheet.getCell(`A${rowNum}`).value = "ID do Relatório";
    worksheet.getCell(`B${rowNum}`).value = report.id;

    rowNum++;
    worksheet.getCell(`A${rowNum}`).value = "Tipo";
    worksheet.getCell(`B${rowNum}`).value = report.type;

    rowNum++;
    worksheet.getCell(`A${rowNum}`).value = "Status";
    worksheet.getCell(`B${rowNum}`).value = report.status;

    if (report.type === "MONTHLY") {
      rowNum++;
      worksheet.getCell(`A${rowNum}`).value = "Mês/Ano";
      worksheet.getCell(`B${rowNum}`).value = `${String(report.month).padStart(
        2,
        "0",
      )}/${report.year}`;
    } else {
      rowNum++;
      worksheet.getCell(`A${rowNum}`).value = "Data Inicial";
      worksheet.getCell(`B${rowNum}`).value = new Date(
        report.startDate!,
      ).toLocaleDateString("pt-BR");

      rowNum++;
      worksheet.getCell(`A${rowNum}`).value = "Data Final";
      worksheet.getCell(`B${rowNum}`).value = new Date(
        report.endDate!,
      ).toLocaleDateString("pt-BR");
    }

    rowNum++;
    worksheet.getCell(`A${rowNum}`).value = "Data de Criação";
    worksheet.getCell(`B${rowNum}`).value = new Date(
      report.createdAt!,
    ).toLocaleDateString("pt-BR");

    rowNum += 2;

    // Dados do Relatório
    if (report.data) {
      const stats = report.data as unknown as DashboardStatistics;

      const headerRow = worksheet.getRow(rowNum);
      headerRow.getCell(1).value = "Estatísticas";
      headerRow.getCell(1).font = { bold: true, size: 11 };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE7E6E6" },
      };

      rowNum++;
      worksheet.getCell(`A${rowNum}`).value = "Manutenções Pendentes";
      worksheet.getCell(`B${rowNum}`).value = stats.pendingMaintenances || 0;

      rowNum++;
      worksheet.getCell(`A${rowNum}`).value = "Ocorrências Abertas";
      worksheet.getCell(`B${rowNum}`).value = stats.openTickets || 0;

      rowNum++;
      worksheet.getCell(`A${rowNum}`).value = "Próximas Manutenções (7 dias)";
      worksheet.getCell(`B${rowNum}`).value = stats.upcomingMaintenances || 0;

      rowNum += 2;

      // Manutenções por Status
      const maintHeaderRow = worksheet.getRow(rowNum);
      maintHeaderRow.getCell(1).value = "Manutenções por Status";
      maintHeaderRow.getCell(1).font = { bold: true, size: 11 };
      maintHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE7E6E6" },
      };

      rowNum++;
      if (stats.maintenancesByStatus) {
        worksheet.getCell(`A${rowNum}`).value = "Agendadas";
        worksheet.getCell(`B${rowNum}`).value =
          stats.maintenancesByStatus.scheduled || 0;

        rowNum++;
        worksheet.getCell(`A${rowNum}`).value = "Em Andamento";
        worksheet.getCell(`B${rowNum}`).value =
          stats.maintenancesByStatus.inProgress || 0;

        rowNum++;
        worksheet.getCell(`A${rowNum}`).value = "Concluídas";
        worksheet.getCell(`B${rowNum}`).value =
          stats.maintenancesByStatus.completed || 0;

        rowNum++;
        worksheet.getCell(`A${rowNum}`).value = "Canceladas";
        worksheet.getCell(`B${rowNum}`).value =
          stats.maintenancesByStatus.canceled || 0;
      }

      rowNum += 2;

      // Tickets por Status
      const ticketHeaderRow = worksheet.getRow(rowNum);
      ticketHeaderRow.getCell(1).value = "Ocorrências por Status";
      ticketHeaderRow.getCell(1).font = { bold: true, size: 11 };
      ticketHeaderRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE7E6E6" },
      };

      rowNum++;
      if (stats.ticketsByStatus) {
        worksheet.getCell(`A${rowNum}`).value = "Abertas";
        worksheet.getCell(`B${rowNum}`).value = stats.ticketsByStatus.open || 0;

        rowNum++;
        worksheet.getCell(`A${rowNum}`).value = "Em Andamento";
        worksheet.getCell(`B${rowNum}`).value =
          stats.ticketsByStatus.inProgress || 0;

        rowNum++;
        worksheet.getCell(`A${rowNum}`).value = "Resolvidas";
        worksheet.getCell(`B${rowNum}`).value =
          stats.ticketsByStatus.resolved || 0;

        rowNum++;
        worksheet.getCell(`A${rowNum}`).value = "Fechadas";
        worksheet.getCell(`B${rowNum}`).value =
          stats.ticketsByStatus.closed || 0;

        rowNum++;
        worksheet.getCell(`A${rowNum}`).value = "Canceladas";
        worksheet.getCell(`B${rowNum}`).value =
          stats.ticketsByStatus.canceled || 0;
      }
    }

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async generateStatisticsExcel(
    statistics: DashboardStatistics,
  ): Promise<Buffer> {
    const workbook = new Workbook();
    const summarySheet = workbook.addWorksheet("Resumo");

    // Headers
    summarySheet.columns = [
      { header: "Métrica", key: "metric", width: 35 },
      { header: "Quantidade", key: "quantity", width: 20 },
    ];

    const headerRow = summarySheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };

    // Dados do Resumo
    let rowNum = 2;
    summarySheet.getCell(`A${rowNum}`).value = "Manutenções Pendentes";
    summarySheet.getCell(`B${rowNum}`).value =
      statistics.pendingMaintenances || 0;

    rowNum++;
    summarySheet.getCell(`A${rowNum}`).value = "Ocorrências Abertas";
    summarySheet.getCell(`B${rowNum}`).value = statistics.openTickets || 0;

    rowNum++;
    summarySheet.getCell(`A${rowNum}`).value = "Próximas Manutenções (7 dias)";
    summarySheet.getCell(`B${rowNum}`).value =
      statistics.upcomingMaintenances || 0;

    rowNum += 2;

    // Detalhes de Manutenção
    const maintSheet = workbook.addWorksheet("Manutenções");
    maintSheet.columns = [
      { header: "Status", key: "status", width: 20 },
      { header: "Quantidade", key: "quantity", width: 20 },
    ];

    const maintHeader = maintSheet.getRow(1);
    maintHeader.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    maintHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF70AD47" },
    };

    let maintRow = 2;
    if (statistics.maintenancesByStatus) {
      maintSheet.getCell(`A${maintRow}`).value = "Agendadas";
      maintSheet.getCell(`B${maintRow}`).value =
        statistics.maintenancesByStatus.scheduled || 0;

      maintRow++;
      maintSheet.getCell(`A${maintRow}`).value = "Em Andamento";
      maintSheet.getCell(`B${maintRow}`).value =
        statistics.maintenancesByStatus.inProgress || 0;

      maintRow++;
      maintSheet.getCell(`A${maintRow}`).value = "Concluídas";
      maintSheet.getCell(`B${maintRow}`).value =
        statistics.maintenancesByStatus.completed || 0;

      maintRow++;
      maintSheet.getCell(`A${maintRow}`).value = "Canceladas";
      maintSheet.getCell(`B${maintRow}`).value =
        statistics.maintenancesByStatus.canceled || 0;
    }

    // Detalhes de Tickets
    const ticketSheet = workbook.addWorksheet("Ocorrências");
    ticketSheet.columns = [
      { header: "Status", key: "status", width: 20 },
      { header: "Quantidade", key: "quantity", width: 20 },
    ];

    const ticketHeader = ticketSheet.getRow(1);
    ticketHeader.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
    ticketHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC55A11" },
    };

    let ticketRow = 2;
    if (statistics.ticketsByStatus) {
      ticketSheet.getCell(`A${ticketRow}`).value = "Abertas";
      ticketSheet.getCell(`B${ticketRow}`).value =
        statistics.ticketsByStatus.open || 0;

      ticketRow++;
      ticketSheet.getCell(`A${ticketRow}`).value = "Em Andamento";
      ticketSheet.getCell(`B${ticketRow}`).value =
        statistics.ticketsByStatus.inProgress || 0;

      ticketRow++;
      ticketSheet.getCell(`A${ticketRow}`).value = "Resolvidas";
      ticketSheet.getCell(`B${ticketRow}`).value =
        statistics.ticketsByStatus.resolved || 0;

      ticketRow++;
      ticketSheet.getCell(`A${ticketRow}`).value = "Fechadas";
      ticketSheet.getCell(`B${ticketRow}`).value =
        statistics.ticketsByStatus.closed || 0;

      ticketRow++;
      ticketSheet.getCell(`A${ticketRow}`).value = "Canceladas";
      ticketSheet.getCell(`B${ticketRow}`).value =
        statistics.ticketsByStatus.canceled || 0;
    }

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }
}
