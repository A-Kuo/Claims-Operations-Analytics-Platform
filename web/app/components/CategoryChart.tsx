"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { serviceCategoryStats } from "../data/claims";

// Soft teal/sky palette, darkest for the highest-volume category.
const COLORS = [
  "#0369A1",
  "#0284C7",
  "#0EA5E9",
  "#38BDF8",
  "#7DD3FC",
  "#A5E4F5",
  "#BAE6FD",
  "#CDEFFB",
  "#E0F2FE",
  "#EFF9FE",
];

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { category: string; claimCount: number; denialRate: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-card-hover">
      <p className="font-semibold text-slate-700">{d.category}</p>
      <p className="tabular-nums text-slate-500">
        {d.claimCount.toLocaleString()} claims · {d.denialRate}% denied
      </p>
    </div>
  );
}

export default function CategoryChart() {
  const top = serviceCategoryStats.slice(0, 6);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Claim Volume by Service Category
        </h3>
        <p className="text-sm text-slate-500">Top 6 categories by claim count</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={top}
            dataKey="claimCount"
            nameKey="category"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            strokeWidth={0}
          >
            {top.map((entry, i) => (
              <Cell key={entry.category} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 space-y-1.5">
        {top.map((entry, i) => (
          <li
            key={entry.category}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              {entry.category}
            </span>
            <span className="tabular-nums font-medium text-slate-700">
              {entry.claimCount.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
