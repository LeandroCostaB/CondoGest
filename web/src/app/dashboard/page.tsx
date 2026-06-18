import Link from "next/link";
import { FileBarChart2 } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Painel</h1>
      <p className="text-gray-600">
        Utilize o menu lateral para navegar pelas funcionalidades do
        CondoGest.
      </p>

      <Link
        href="/dashboard/relatorios"
        className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-6 py-4 font-semibold text-primary shadow-sm transition hover:shadow-md"
      >
        <FileBarChart2 size={20} />
        Ir para Relatórios
      </Link>
    </div>
  );
}
