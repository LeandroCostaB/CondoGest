export type ReportType = "MONTHLY" | "CUSTOM";

export type ReportStatus = "PENDING" | "GENERATED" | "EXPORTED";

export interface MaintenancesByStatus {
  scheduled: number;
  inProgress: number;
  completed: number;
  canceled: number;
}

export interface TicketsByStatus {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  canceled: number;
}

export interface DashboardStatistics {
  pendingMaintenances: number;
  openTickets: number;
  upcomingMaintenances: number;
  maintenancesByStatus: MaintenancesByStatus;
  ticketsByStatus: TicketsByStatus;
}

export interface Report {
  id: string;
  condominiumId: string;
  type: ReportType;
  status: ReportStatus;
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  data?: DashboardStatistics;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthlyReportInput {
  condominiumId: string;
  month: number;
  year: number;
}

export interface CreateCustomReportInput {
  condominiumId: string;
  startDate: string;
  endDate: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
}
