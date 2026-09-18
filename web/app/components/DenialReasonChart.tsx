"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { topDenialReasons } from "../data/denials";

const CATEGORY_COLORS: Record<string, string> = {
  Coding: "#0284C7",
  Documentation: "#0EA5E9",
  Authorization: "#D97706",
  Provider: "#64748B",
  Eligibility: "#7C3AED",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: {
    payload: { code: string; description: string; category: string; events: number };
  }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-card-hover">
      <p className="font-semibold text-slate-700">
        {d.code} — {d.description}
      </p>
      <p className="tabular-nums text-slate-500">
        {d.category} · {d.events.toLocaleString()} events
      </p>
    </div>
  );
}

export default function DenialReasonChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Top Denial Reasons
        </h3>
        <p className="text-sm text-slate-500">
          By event count, all-time, colored by category
        </p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={topDenialReasons}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="code"
            width={64}
            tick={{ fill: "#475569", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="events" radius={[0, 8, 8, 0]} barSize={22}>
            {topDenialReasons.map((entry) => (
              <Cell key={entry.code} fill={CATEGORY_COLORS[entry.category] ?? "#94A3B8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500">
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <li key={category} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            {category}
          </li>
        ))}
      </ul>
    </div>
  );
}
