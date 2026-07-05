"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_COLORS } from "@/lib/constants";

type Datum = { name: string; value: number };

export function DonutChart({ data }: { data: Datum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) {
    return <EmptyChart />;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function VerticalBarChart({
  data,
  color = "#6366f1",
}: {
  data: Datum[];
  color?: string;
}) {
  if (data.every((d) => d.value === 0)) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickLine={false}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
      No data to display yet.
    </div>
  );
}
