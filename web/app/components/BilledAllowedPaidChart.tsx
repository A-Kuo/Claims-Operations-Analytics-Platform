"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { billedAllowedPaidByCategory } from "../data/providers";

function formatMoney(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-card-hover">
      <p className="mb-1.5 font-semibold text-slate-700">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="tabular-nums text-slate-500">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.dataKey}: <span className="font-semibold text-slate-800">{formatMoney(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export default function BilledAllowedPaidChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Billed vs. Allowed vs. Paid
        </h3>
        <p className="text-sm text-slate-500">
          By service category (log scale — volume ranges from $685K to $70M)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={billedAllowedPaidByCategory}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke="#F1F5F9" horizontal={false} />
          <XAxis
            type="number"
            scale="log"
            domain={[100000, "dataMax"]}
            allowDataOverflow
            tickFormatter={formatMoney}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={140}
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="billed" name="Billed" fill="#0369A1" radius={[0, 4, 4, 0]} barSize={8} />
          <Bar dataKey="allowed" name="Allowed" fill="#38BDF8" radius={[0, 4, 4, 0]} barSize={8} />
          <Bar dataKey="paid" name="Paid" fill="#BAE6FD" radius={[0, 4, 4, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
