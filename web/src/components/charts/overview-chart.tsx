"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface OverviewChartDatum {
  label: string;
  value: number;
}

interface OverviewChartProps {
  title: string;
  data: OverviewChartDatum[];
}

export function OverviewChart({ title, data }: OverviewChartProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid horizontal={false} stroke="#E5E7EB" />
            <XAxis
              type="number"
              allowDecimals={false}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="label"
              stroke="#9CA3AF"
              fontSize={12}
              width={90}
            />
            <Tooltip cursor={{ fill: "rgba(124, 131, 232, 0.1)" }} />
            <Bar
              dataKey="value"
              fill="#7C83E8"
              radius={[0, 4, 4, 0]}
              barSize={18}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
