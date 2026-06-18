"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { OverviewChart } from "@/components/charts/overview-chart";
import { ExportButtons } from "@/components/export/export-button";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { ApiError } from "@/lib/api";
import {
  cn,
  formatDate,
  formatReportPeriod,
  MAINTENANCE_STATUS_LABELS,
  MONTH_NAMES,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_STYLES,
  REPORT_TYPE_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/utils";
import { listCondominiums } from "@/services/auth";
import {
  createCustomReport,
  createMonthlyReport,
  deleteReport,
  downloadReportFile,
  downloadStatisticsFile,
  getDashboardStatistics,
  listReportsByCondominium,
} from "@/services/reports";
import type { Condominium } from "@/types/auth";
import type {
  DashboardStatistics,
  MaintenancesByStatus,
  Report,
  ReportType,
  TicketsByStatus,
} from "@/types/report";

const SELECTED_CONDOMINIUM_KEY = "condogest_selected_condominium";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

interface StatCardProps {
  label: string;
  value: number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}

export default function RelatoriosPage() {
  const [condominiums, setCondominiums] = useState<Condominium[]>([]);
  const [selectedCondominiumId, setSelectedCondominiumId] = useState("");
  const [loadingCondominiums, setLoadingCondominiums] = useState(true);
  const [condominiumsError, setCondominiumsError] = useState<string | null>(
    null,
  );

  const [statistics, setStatistics] = useState<DashboardStatistics | null>(
    null,
  );
  const [statisticsError, setStatisticsError] = useState<string | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);

  const [reportType, setReportType] = useState<ReportType>("MONTHLY");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const data = await listCondominiums();
        setCondominiums(data);

        const stored = window.localStorage.getItem(SELECTED_CONDOMINIUM_KEY);
        const initial =
          (stored && data.some((c) => c.id === stored) && stored) ||
          data[0]?.id ||
          "";
        setSelectedCondominiumId(initial);
      } catch (error) {
        setCondominiumsError(
          getErrorMessage(error, "Erro ao carregar condomínios."),
        );
      } finally {
        setLoadingCondominiums(false);
      }
    }

    async function loadStatistics() {
      try {
        setStatistics(await getDashboardStatistics());
      } catch (error) {
        setStatisticsError(
          getErrorMessage(error, "Erro ao carregar estatísticas."),
        );
      }
    }

    void loadInitialData();
    void loadStatistics();
  }, []);

  const loadReports = useCallback(async (condominiumId: string) => {
    setLoadingReports(true);
    setReportsError(null);
    try {
      setReports(await listReportsByCondominium(condominiumId));
    } catch (error) {
      setReportsError(getErrorMessage(error, "Erro ao carregar relatórios."));
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedCondominiumId) return;
    window.localStorage.setItem(
      SELECTED_CONDOMINIUM_KEY,
      selectedCondominiumId,
    );
    void loadReports(selectedCondominiumId);
  }, [selectedCondominiumId, loadReports]);

  async function handleGenerateReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCondominiumId) return;

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (reportType === "MONTHLY") {
        await createMonthlyReport({
          condominiumId: selectedCondominiumId,
          month,
          year,
        });
      } else {
        await createCustomReport({
          condominiumId: selectedCondominiumId,
          startDate,
          endDate,
        });
      }
      setFormSuccess("Relatório gerado com sucesso.");
      await loadReports(selectedCondominiumId);
    } catch (error) {
      setFormError(getErrorMessage(error, "Erro ao gerar relatório."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteReport(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir este relatório?")) {
      return;
    }

    try {
      await deleteReport(id);
      setReports((prev) => prev.filter((report) => report.id !== id));
    } catch (error) {
      alert(getErrorMessage(error, "Erro ao excluir relatório."));
    }
  }

  const maintenanceChartData = statistics
    ? Object.entries(statistics.maintenancesByStatus).map(([key, value]) => ({
        label: MAINTENANCE_STATUS_LABELS[key as keyof MaintenancesByStatus],
        value,
      }))
    : [];

  const ticketChartData = statistics
    ? Object.entries(statistics.ticketsByStatus).map(([key, value]) => ({
        label: TICKET_STATUS_LABELS[key as keyof TicketsByStatus],
        value,
      }))
    : [];

  const columns: DataTableColumn<Report>[] = [
    {
      key: "type",
      header: "Tipo",
      render: (report) => REPORT_TYPE_LABELS[report.type],
    },
    {
      key: "period",
      header: "Período",
      render: (report) => formatReportPeriod(report),
    },
    {
      key: "status",
      header: "Status",
      render: (report) => (
        <span
          className={cn(
            "rounded-full px-2 py-1 text-xs font-medium",
            REPORT_STATUS_STYLES[report.status],
          )}
        >
          {REPORT_STATUS_LABELS[report.status]}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Criado em",
      render: (report) => formatDate(report.createdAt),
    },
    {
      key: "actions",
      header: "Ações",
      render: (report) => (
        <div className="flex items-center gap-2">
          <ExportButtons
            onExportPdf={() => downloadReportFile(report.id, "pdf")}
            onExportExcel={() => downloadReportFile(report.id, "excel")}
          />
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => handleDeleteReport(report.id)}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>

        <div className="flex items-center gap-2">
          <label htmlFor="condominium" className="text-sm text-gray-600">
            Condomínio
          </label>
          <select
            id="condominium"
            value={selectedCondominiumId}
            onChange={(event) => setSelectedCondominiumId(event.target.value)}
            disabled={loadingCondominiums || condominiums.length === 0}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {condominiums.map((condominium) => (
              <option key={condominium.id} value={condominium.id}>
                {condominium.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {condominiumsError && (
        <p className="text-sm text-danger">{condominiumsError}</p>
      )}
      {!loadingCondominiums && condominiums.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhum condomínio cadastrado para o seu usuário.
        </p>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Visão geral
          </h2>
          {statistics && (
            <ExportButtons
              onExportPdf={() => downloadStatisticsFile("pdf")}
              onExportExcel={() => downloadStatisticsFile("excel")}
            />
          )}
        </div>

        {statisticsError && (
          <p className="text-sm text-danger">{statisticsError}</p>
        )}

        {statistics && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Manutenções pendentes"
                value={statistics.pendingMaintenances}
              />
              <StatCard
                label="Ocorrências abertas"
                value={statistics.openTickets}
              />
              <StatCard
                label="Próximas manutenções"
                value={statistics.upcomingMaintenances}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <OverviewChart
                title="Manutenções por status"
                data={maintenanceChartData}
              />
              <OverviewChart
                title="Ocorrências por status"
                data={ticketChartData}
              />
            </div>
          </>
        )}
      </section>

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Gerar relatório
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReportType("MONTHLY")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              reportType === "MONTHLY"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            Mensal
          </button>
          <button
            type="button"
            onClick={() => setReportType("CUSTOM")}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              reportType === "CUSTOM"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            Personalizado
          </button>
        </div>

        <form
          onSubmit={handleGenerateReport}
          className="flex flex-wrap items-end gap-4"
        >
          {reportType === "MONTHLY" ? (
            <>
              <div>
                <label
                  htmlFor="month"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mês
                </label>
                <select
                  id="month"
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {MONTH_NAMES.map((name, index) => (
                    <option key={name} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ano
                </label>
                <input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className="mt-1 w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Data inicial
                </label>
                <input
                  id="startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Data final
                </label>
                <input
                  id="endDate"
                  type="date"
                  required
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </>
          )}

          <Button type="submit" disabled={submitting || !selectedCondominiumId}>
            {submitting ? "Gerando..." : "Gerar relatório"}
          </Button>
        </form>

        {formError && <p className="text-sm text-danger">{formError}</p>}
        {formSuccess && (
          <p className="text-sm text-accent">{formSuccess}</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Relatórios gerados
        </h2>

        {reportsError && (
          <p className="text-sm text-danger">{reportsError}</p>
        )}

        <DataTable
          columns={columns}
          data={reports}
          getRowKey={(report) => report.id}
          emptyMessage={
            loadingReports
              ? "Carregando relatórios..."
              : "Nenhum relatório gerado para este condomínio."
          }
        />
      </section>
    </div>
  );
}
