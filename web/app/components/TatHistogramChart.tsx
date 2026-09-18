"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tatHistogram } from "../data/journey";

// Turnaround buckets are categorical (0-7, 8-14, ...), not a continuous axis,
// so SLA compliance is shown by bar color rather than a reference line:
// 0-7 and 8-14 days are within the 14-day adjudication SLA; 15+ are breaches;
// "Still open" is neither yet.
const BUCKET_COLOR: Record<string, string> = {
  "0-7 days": "#059669",
  "8-14 days": "#38BDF8",
  "15-21 days": "#D97706",
  "22-30 days": "#EA580C",
  "31+ days": "#DC2626",
  "Still open": "#94A3B8",
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { bucket: string; count: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-card-hover">
      <p className="font-semibold text-slate-700">{d.bucket}</p>
      <p className="tabular-nums text-slate-500">{d.count.toLocaleString()} claims</p>
    </div>
  );
}

export default function TatHistogramChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Turnaround Time Distribution
        </h3>
        <p className="text-sm text-slate-500">
          Green/blue = within the 14-day SLA, amber/red = beyond it
        </p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={tatHistogram} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="bucket"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#94A3B8", fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={44}>
            {tatHistogram.map((entry) => (
              <Cell key={entry.bucket} fill={BUCKET_COLOR[entry.bucket] ?? "#94A3B8"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
