"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { weeklyTrend } from "../data/claims";

function formatWeek(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
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
      <p className="mb-1.5 font-semibold text-slate-700">
        Week of {formatWeek(label ?? "")}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} className="tabular-nums text-slate-500">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          {p.dataKey === "submitted"
            ? "Submitted"
            : p.dataKey === "adjudicated"
              ? "Adjudicated"
              : "SLA breaches"}
          : <span className="font-semibold text-slate-800">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function TrendChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Claims Submitted &amp; Adjudicated
        </h3>
        <p className="text-sm text-slate-500">
          Weekly volume, last 12 complete weeks
        </p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={weeklyTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="submittedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#0284C7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="adjudicatedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="weekStart"
            tickFormatter={formatWeek}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={["dataMin - 30", "dataMax + 20"]}
            tick={{ fill: "#94A3B8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="adjudicated"
            stroke="#94A3B8"
            strokeWidth={2}
            fill="url(#adjudicatedFill)"
          />
          <Area
            type="monotone"
            dataKey="submitted"
            stroke="#0284C7"
            strokeWidth={2.5}
            fill="url(#submittedFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
