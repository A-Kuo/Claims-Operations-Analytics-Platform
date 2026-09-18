import { outlierProviders, type RiskBucket } from "../data/providers";

const RISK_CLASSES: Record<RiskBucket, string> = {
  high: "bg-rose-50 text-rose-700 border-rose-200",
  watch: "bg-amber-50 text-amber-700 border-amber-200",
  in_control: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function OutlierProviderTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900">
          Outlier Providers
        </h3>
        <p className="text-sm text-slate-500">
          Individual providers, 50+ claims, ranked by denial rate
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Provider</th>
              <th className="px-6 py-3 font-medium">Group</th>
              <th className="px-6 py-3 font-medium">Claims</th>
              <th className="px-6 py-3 font-medium">Denial Rate</th>
              <th className="px-6 py-3 font-medium">Rework Rate</th>
              <th className="px-6 py-3 font-medium">Avg. TAT</th>
              <th className="px-6 py-3 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody>
            {outlierProviders.map((row) => (
              <tr
                key={row.providerName}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
              >
                <td className="px-6 py-3.5 font-medium text-slate-700">
                  {row.providerName}
                </td>
                <td className="px-6 py-3.5 text-slate-600">{row.providerGroup}</td>
                <td className="px-6 py-3.5 tabular-nums text-slate-600">
                  {row.claimCount}
                </td>
                <td className="px-6 py-3.5 tabular-nums font-medium text-slate-700">
                  {row.denialRate.toFixed(1)}%
                </td>
                <td className="px-6 py-3.5 tabular-nums text-slate-600">
                  {row.reworkRate.toFixed(1)}%
                </td>
                <td className="px-6 py-3.5 tabular-nums text-slate-600">
                  {row.avgTurnaroundDays.toFixed(1)}d
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${RISK_CLASSES[row.riskBucket]}`}
                  >
                    {row.riskBucket === "high" ? "High" : row.riskBucket === "watch" ? "Watch" : "In Control"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
