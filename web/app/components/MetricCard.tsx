import type { Metric } from "../data/claims";

const TONE_CLASSES: Record<Metric["tone"], string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <p className="text-sm font-medium text-slate-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
        {metric.value}
      </p>
      <span
        className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${TONE_CLASSES[metric.tone]}`}
      >
        {metric.badge}
      </span>
    </div>
  );
}
