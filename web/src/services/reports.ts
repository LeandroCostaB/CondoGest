import { downloadBlob, ticketApi } from "@/lib/api";
import type {
  CreateCustomReportInput,
  CreateMonthlyReportInput,
  DashboardStatistics,
  Report,
} from "@/types/report";

export type ExportFormat = "pdf" | "excel";

export async function getDashboardStatistics(): Promise<DashboardStatistics> {
  return ticketApi.get<DashboardStatistics>("/reports/dashboard/statistics");
}

export async function createMonthlyReport(
  input: CreateMonthlyReportInput,
): Promise<Report> {
  return ticketApi.post<Report>("/reports/monthly", {
    ...input,
    type: "MONTHLY",
  });
}

export async function createCustomReport(
  input: CreateCustomReportInput,
): Promise<Report> {
  return ticketApi.post<Report>("/reports/custom", {
    ...input,
    type: "CUSTOM",
  });
}

export async function listReportsByCondominium(
  condominiumId: string,
): Promise<Report[]> {
  return ticketApi.get<Report[]>(`/reports/condominium/${condominiumId}`);
}

export async function deleteReport(id: string): Promise<void> {
  return ticketApi.delete<void>(`/reports/${id}`);
}

export async function downloadReportFile(
  id: string,
  format: ExportFormat,
): Promise<void> {
  const { blob, filename } = await ticketApi.getBlob(
    `/reports/${id}/export/${format}`,
  );
  downloadBlob(blob, filename);
}

export async function downloadStatisticsFile(
  format: ExportFormat,
): Promise<void> {
  const { blob, filename } = await ticketApi.getBlob(
    `/reports/dashboard/statistics/export/${format}`,
  );
  downloadBlob(blob, filename);
}
