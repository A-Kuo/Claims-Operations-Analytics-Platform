"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { statusFunnel } from "../data/journey";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#94A3B8",
  in_review: "#7DD3FC",
  pended: "#38BDF8",
  approved: "#0284C7",
  denied: "#DC2626",
  paid: "#059669",
  voided: "#CBD5E1",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { label: string; count: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-card-hover">
      <p className="font-semibold text-slate-700">{d.label}</p>
      <p className="tabular-nums text-slate-500">{d.count.toLocaleString()} claims</p>
    </div>
  );
}

export default function StatusFunnelChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Current Status
        </h3>
        <p className="text-sm text-slate-500">
          Every KPI-eligible claim, by current status (log scale — paid
          claims outnumber most other statuses 30-to-1)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={statusFunnel}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
        >
          <XAxis type="number" scale="log" domain={[100, "dataMax"]} allowDataOverflow hide />
          <YAxis
            type="category"
            dataKey="label"
            width={80}
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
            {statusFunnel.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94A3B8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
