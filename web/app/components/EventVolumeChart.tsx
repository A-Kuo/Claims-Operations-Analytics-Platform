"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { eventVolumes } from "../data/journey";

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
      <p className="tabular-nums text-slate-500">{d.count.toLocaleString()} events</p>
    </div>
  );
}

export default function EventVolumeChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Lifecycle Event Volume
        </h3>
        <p className="text-sm text-slate-500">
          All-time event counts, main path and rework branches (log scale)
        </p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={eventVolumes}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
        >
          <CartesianGrid stroke="#F1F5F9" horizontal={false} />
          <XAxis
            type="number"
            scale="log"
            domain={[100, "dataMax"]}
            allowDataOverflow
            tickFormatter={(v: number) => v.toLocaleString()}
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={130}
            tick={{ fill: "#475569", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill="#0284C7" radius={[0, 6, 6, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
