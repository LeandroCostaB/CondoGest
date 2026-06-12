import { Injectable } from "@nestjs/common";
import type { ReportDto } from "@reports/application/dto/report.dto";
import PDFDocument from "pdfkit";
import type { DashboardStatistics } from "./dashboard-statistics.service";

@Injectable()
export class PDFExportService {
  generateReportPDF(report: ReportDto): Promise<Buffer> {
    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const buffers: Buffer[] = [];
    pdf.on("data", (chunk: Buffer) => buffers.push(chunk));

    // Cabeçalho
    pdf.fontSize(20).font("Helvetica-Bold").text("Relatório de Condomínio", {
      align: "center",
    });
    pdf
      .fontSize(10)
      .font("Helvetica")
      .text(`ID: ${report.id}`, { align: "center" });

    if (report.type === "MONTHLY" && report.month && report.year) {
      pdf.text(
        `Período: ${String(report.month).padStart(2, "0")}/${report.year}`,
        { align: "center" },
      );
    } else if (report.type === "CUSTOM" && report.startDate && report.endDate) {
      const startFormatted = new Date(report.startDate).toLocaleDateString(
        "pt-BR",
      );
      const endFormatted = new Date(report.endDate).toLocaleDateString("pt-BR");
      pdf.text(`Período: ${startFormatted} a ${endFormatted}`, {
        align: "center",
      });
    }

    pdf.moveDown();

    // Status
    pdf.fontSize(12).font("Helvetica-Bold").text("Status do Relatório");
    pdf
      .fontSize(10)
      .font("Helvetica")
      .text(`Status: ${report.status}`, { indent: 10 })
      .text(
        `Data de Criação: ${new Date(report.createdAt!).toLocaleDateString(
          "pt-BR",
        )}`,
        { indent: 10 },
      );

    pdf.moveDown();

    // Dados
    if (report.data) {
      const stats = report.data as unknown as DashboardStatistics;

      pdf.fontSize(12).font("Helvetica-Bold").text("Estatísticas Gerais");

      pdf
        .fontSize(10)
        .font("Helvetica")
        .text(`Manutenções Pendentes: ${stats.pendingMaintenances || 0}`, {
          indent: 10,
        })
        .text(`Ocorrências Abertas: ${stats.openTickets || 0}`, { indent: 10 })
        .text(
          `Próximas Manutenções (7 dias): ${stats.upcomingMaintenances || 0}`,
          { indent: 10 },
        );

      pdf.moveDown();

      // Manutenções por status
      pdf.fontSize(12).font("Helvetica-Bold").text("Manutenções por Status");

      if (stats.maintenancesByStatus) {
        pdf
          .fontSize(10)
          .font("Helvetica")
          .text(`Agendadas: ${stats.maintenancesByStatus.scheduled || 0}`, {
            indent: 10,
          })
          .text(`Em Andamento: ${stats.maintenancesByStatus.inProgress || 0}`, {
            indent: 10,
          })
          .text(`Concluídas: ${stats.maintenancesByStatus.completed || 0}`, {
            indent: 10,
          })
          .text(`Canceladas: ${stats.maintenancesByStatus.canceled || 0}`, {
            indent: 10,
          });
      }

      pdf.moveDown();

      // Tickets por status
      pdf.fontSize(12).font("Helvetica-Bold").text("Ocorrências por Status");

      if (stats.ticketsByStatus) {
        pdf
          .fontSize(10)
          .font("Helvetica")
          .text(`Abertas: ${stats.ticketsByStatus.open || 0}`, { indent: 10 })
          .text(`Em Andamento: ${stats.ticketsByStatus.inProgress || 0}`, {
            indent: 10,
          })
          .text(`Resolvidas: ${stats.ticketsByStatus.resolved || 0}`, {
            indent: 10,
          })
          .text(`Fechadas: ${stats.ticketsByStatus.closed || 0}`, {
            indent: 10,
          })
          .text(`Canceladas: ${stats.ticketsByStatus.canceled || 0}`, {
            indent: 10,
          });
      }
    }

    pdf.moveDown(2);
    pdf
      .fontSize(8)
      .font("Helvetica")
      .text(
        `Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`,
        { align: "center" },
      );

    pdf.end();

    return new Promise((resolve) => {
      pdf.on("end", () => resolve(Buffer.concat(buffers)));
    });
  }

  generateStatisticsPDF(statistics: DashboardStatistics): Promise<Buffer> {
    const pdf = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const buffers: Buffer[] = [];
    pdf.on("data", (chunk: Buffer) => buffers.push(chunk));

    // Cabeçalho
    pdf.fontSize(20).font("Helvetica-Bold").text("Dashboard - Estatísticas", {
      align: "center",
    });
    pdf
      .fontSize(10)
      .font("Helvetica")
      .text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, {
        align: "center",
      });

    pdf.moveDown();

    // Resumo
    pdf.fontSize(14).font("Helvetica-Bold").text("Resumo Executivo");

    pdf
      .fontSize(11)
      .font("Helvetica")
      .text(`Manutenções Pendentes: ${statistics.pendingMaintenances || 0}`)
      .text(`Ocorrências Abertas: ${statistics.openTickets || 0}`)
      .text(
        `Próximas Manutenções (7 dias): ${
          statistics.upcomingMaintenances || 0
        }`,
      );

    pdf.moveDown();

    // Manutenções
    pdf.fontSize(12).font("Helvetica-Bold").text("Status das Manutenções");

    if (statistics.maintenancesByStatus) {
      pdf
        .fontSize(10)
        .font("Helvetica")
        .text(`• Agendadas: ${statistics.maintenancesByStatus.scheduled || 0}`)
        .text(
          `• Em Andamento: ${statistics.maintenancesByStatus.inProgress || 0}`,
        )
        .text(`• Concluídas: ${statistics.maintenancesByStatus.completed || 0}`)
        .text(`• Canceladas: ${statistics.maintenancesByStatus.canceled || 0}`);
    }

    pdf.moveDown();

    // Tickets
    pdf.fontSize(12).font("Helvetica-Bold").text("Status das Ocorrências");

    if (statistics.ticketsByStatus) {
      pdf
        .fontSize(10)
        .font("Helvetica")
        .text(`• Abertas: ${statistics.ticketsByStatus.open || 0}`)
        .text(`• Em Andamento: ${statistics.ticketsByStatus.inProgress || 0}`)
        .text(`• Resolvidas: ${statistics.ticketsByStatus.resolved || 0}`)
        .text(`• Fechadas: ${statistics.ticketsByStatus.closed || 0}`)
        .text(`• Canceladas: ${statistics.ticketsByStatus.canceled || 0}`);
    }

    pdf.end();

    return new Promise((resolve) => {
      pdf.on("end", () => resolve(Buffer.concat(buffers)));
    });
  }
}
