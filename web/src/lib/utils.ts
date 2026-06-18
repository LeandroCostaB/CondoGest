import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  MaintenancesByStatus,
  Report,
  ReportStatus,
  ReportType,
  TicketsByStatus,
} from "@/types/report";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value?: string | Date): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR");
}

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function formatReportPeriod(report: Report): string {
  if (report.type === "MONTHLY" && report.month && report.year) {
    return `${MONTH_NAMES[report.month - 1]} / ${report.year}`;
  }
  if (report.startDate && report.endDate) {
    return `${formatDate(report.startDate)} – ${formatDate(report.endDate)}`;
  }
  return "—";
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  MONTHLY: "Mensal",
  CUSTOM: "Personalizado",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: "Pendente",
  GENERATED: "Gerado",
  EXPORTED: "Exportado",
};

export const REPORT_STATUS_STYLES: Record<ReportStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  GENERATED: "bg-blue-100 text-blue-800",
  EXPORTED: "bg-green-100 text-green-800",
};

export const MAINTENANCE_STATUS_LABELS: Record<
  keyof MaintenancesByStatus,
  string
> = {
  scheduled: "Agendadas",
  inProgress: "Em andamento",
  completed: "Concluídas",
  canceled: "Canceladas",
};

export const TICKET_STATUS_LABELS: Record<keyof TicketsByStatus, string> = {
  open: "Abertos",
  inProgress: "Em andamento",
  resolved: "Resolvidos",
  closed: "Fechados",
  canceled: "Cancelados",
};
