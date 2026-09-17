import { claimRegister, type RiskTier } from "../data/claims";

const RISK_LABEL: Record<RiskTier, string> = {
  low: "Low Risk",
  elevated: "Elevated Risk",
  critical: "Critical",
};

const RISK_CLASSES: Record<RiskTier, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  elevated: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function ClaimRegisterTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900">
          Claim Register &amp; Risk Status
        </h3>
        <p className="text-sm text-slate-500">
          A sample of individual claims, drawn across the last 8 weeks
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Claim ID</th>
              <th className="px-6 py-3 font-medium">Submitted</th>
              <th className="px-6 py-3 font-medium">Service Category</th>
              <th className="px-6 py-3 font-medium">Provider Group</th>
              <th className="px-6 py-3 font-medium">Turnaround</th>
              <th className="px-6 py-3 font-medium">Risk</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {claimRegister.map((claim) => (
              <tr
                key={claim.claimId}
                className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
              >
                <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                  {claim.claimId}
                </td>
                <td className="px-6 py-3.5 tabular-nums text-slate-600">
                  {formatDate(claim.submissionDate)}
                </td>
                <td className="px-6 py-3.5 text-slate-600">
                  {claim.serviceCategory}
                </td>
                <td className="px-6 py-3.5 text-slate-600">
                  {claim.providerGroup}
                </td>
                <td className="px-6 py-3.5 tabular-nums text-slate-600">
                  {claim.turnaroundDays !== null
                    ? `${claim.turnaroundDays} days`
                    : "—"}
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${RISK_CLASSES[claim.risk]}`}
                  >
                    {RISK_LABEL[claim.risk]}
                  </span>
                </td>
                <td className="px-6 py-3.5 capitalize text-slate-600">
                  {claim.status.replace("_", " ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
