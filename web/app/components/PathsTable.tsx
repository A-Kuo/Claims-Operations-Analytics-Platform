import { commonPaths } from "../data/journey";

const TOTAL = commonPaths.reduce((sum, p) => sum + p.count, 0);

export default function PathsTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900">
          Common Outcome Paths
        </h3>
        <p className="text-sm text-slate-500">
          Every KPI-eligible claim, grouped by how it resolved ({TOTAL.toLocaleString()} total)
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        {commonPaths.map((p) => {
          const pct = (p.count / TOTAL) * 100;
          return (
            <li key={p.path} className="flex items-center justify-between px-6 py-3.5">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">{p.path}</p>
                <div className="mt-1.5 h-1.5 w-full max-w-xs rounded-full bg-slate-100">
                  <div
                    className="h-1.5 rounded-full bg-sky-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="ml-6 text-right">
                <p className="tabular-nums font-semibold text-slate-800">
                  {p.count.toLocaleString()}
                </p>
                <p className="tabular-nums text-xs text-slate-400">
                  {pct.toFixed(1)}%
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
