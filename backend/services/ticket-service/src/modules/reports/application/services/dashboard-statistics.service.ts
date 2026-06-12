import { maintenanceSchema } from "@maintenance/infra/database/schemas/maintenance.schema";
import { Injectable } from "@nestjs/common";
import { DB, getDb } from "@shared/infra/database";
import { ticketsSchema } from "@tickets/infra/database/schemas/ticket.schema";
import { sql } from "drizzle-orm";

export interface DashboardStatistics {
  pendingMaintenances: number;
  openTickets: number;
  upcomingMaintenances: number;
  maintenancesByStatus: {
    scheduled: number;
    inProgress: number;
    completed: number;
    canceled: number;
  };
  ticketsByStatus: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    canceled: number;
  };
}

@Injectable()
export class DashboardStatisticsService {
  private db: DB;

  constructor() {
    this.db = getDb();
  }

  async getStatistics(condominiumId?: string): Promise<DashboardStatistics> {
    // Manutenções pendentes (SCHEDULED)
    const pendingMaintenances = await this.db
      .select({ count: sql<number>`CAST(COUNT(*) as INTEGER)` })
      .from(maintenanceSchema)
      .where(sql`status = 'SCHEDULED'`);

    // Ocorrências abertas (OPEN, IN_PROGRESS)
    const openTickets = await this.db
      .select({ count: sql<number>`CAST(COUNT(*) as INTEGER)` })
      .from(ticketsSchema)
      .where(sql`status IN ('OPEN', 'IN_PROGRESS')`);

    // Próximas manutenções (SCHEDULED nos próximos 7 dias)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingMaintenances = await this.db
      .select({ count: sql<number>`CAST(COUNT(*) as INTEGER)` })
      .from(maintenanceSchema)
      .where(
        sql`status = 'SCHEDULED' AND execution_date BETWEEN ${now} AND ${nextWeek}`,
      );

    // Manutenções por status
    const maintenancesByStatus = await this.db
      .select({
        status: maintenanceSchema.status,
        count: sql<number>`CAST(COUNT(*) as INTEGER)`,
      })
      .from(maintenanceSchema)
      .groupBy(maintenanceSchema.status);

    // Tickets por status
    const ticketsByStatus = await this.db
      .select({
        status: ticketsSchema.status,
        count: sql<number>`CAST(COUNT(*) as INTEGER)`,
      })
      .from(ticketsSchema)
      .groupBy(ticketsSchema.status);

    // Mapear resultados
    const maintenanceStatusMap: DashboardStatistics["maintenancesByStatus"] = {
      scheduled: 0,
      inProgress: 0,
      completed: 0,
      canceled: 0,
    };

    maintenancesByStatus.forEach((item: { status: string; count: number }) => {
      const status = item.status.toLowerCase();
      if (status === "scheduled") maintenanceStatusMap.scheduled = item.count;
      if (status === "in_progress")
        maintenanceStatusMap.inProgress = item.count;
      if (status === "completed") maintenanceStatusMap.completed = item.count;
      if (status === "canceled") maintenanceStatusMap.canceled = item.count;
    });

    const ticketStatusMap: DashboardStatistics["ticketsByStatus"] = {
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      canceled: 0,
    };

    ticketsByStatus.forEach((item: { status: string; count: number }) => {
      const status = item.status.toLowerCase();
      if (status === "open") ticketStatusMap.open = item.count;
      if (status === "in_progress") ticketStatusMap.inProgress = item.count;
      if (status === "resolved") ticketStatusMap.resolved = item.count;
      if (status === "closed") ticketStatusMap.closed = item.count;
      if (status === "canceled") ticketStatusMap.canceled = item.count;
    });

    return {
      pendingMaintenances: pendingMaintenances[0]?.count || 0,
      openTickets: openTickets[0]?.count || 0,
      upcomingMaintenances: upcomingMaintenances[0]?.count || 0,
      maintenancesByStatus: maintenanceStatusMap,
      ticketsByStatus: ticketStatusMap,
    };
  }
}
