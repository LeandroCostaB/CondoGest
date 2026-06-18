"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExportFormat = "pdf" | "excel";

interface ExportButtonsProps {
  onExportPdf: () => Promise<void>;
  onExportExcel: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function ExportButtons({
  onExportPdf,
  onExportExcel,
  disabled,
  className,
}: ExportButtonsProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  async function handleExport(format: ExportFormat, action: () => Promise<void>) {
    setLoading(format);
    try {
      await action();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao exportar arquivo.",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || loading !== null}
        onClick={() => handleExport("pdf", onExportPdf)}
      >
        {loading === "pdf" ? "Exportando..." : "PDF"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || loading !== null}
        onClick={() => handleExport("excel", onExportExcel)}
      >
        {loading === "excel" ? "Exportando..." : "Excel"}
      </Button>
    </div>
  );
}
