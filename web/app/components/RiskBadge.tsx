import type { SearchRisk } from "../lib/claimSearch";

const LABEL: Record<SearchRisk, string> = {
  low: "Low Risk",
  elevated: "Elevated Risk",
  critical: "Critical",
};

const CLASSES: Record<SearchRisk, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  elevated: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function RiskBadge({ risk }: { risk: SearchRisk }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${CLASSES[risk]}`}
    >
      {LABEL[risk]}
    </span>
  );
}
