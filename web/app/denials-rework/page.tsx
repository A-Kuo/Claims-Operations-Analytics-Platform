import PageHeader from "../components/PageHeader";
import MetricCard from "../components/MetricCard";
import DenialReasonChart from "../components/DenialReasonChart";
import ProviderDenialTable from "../components/ProviderDenialTable";
import { denialMetrics, topDenialReasons, providerGroupDenialRates } from "../data/denials";

export default function DenialsReworkPage() {
  return (
    <>
      <PageHeader
        title="Denials & Rework"
        subtitle="Why claims get denied, and which provider groups drive it"
        exportFilename="denial_reasons.csv"
        exportHeaders={["code", "description", "category", "events"]}
        exportRows={topDenialReasons.map((r) => [r.code, r.description, r.category, r.events])}
      />

      <section className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {denialMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 px-6 pb-6 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <DenialReasonChart />
        </div>
        <div className="lg:col-span-7">
          <ProviderDenialTable />
        </div>
      </section>

      <footer className="px-6 pb-10 md:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          <p>
            Denial reasons and provider-group rates are computed from{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              fct_denials
            </code>
            ,{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              dim_denial_reason
            </code>
            , and{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              mart_provider_performance
            </code>{" "}
            — the same marts behind the Streamlit dashboard&apos;s Denials and
            Rework page. Static export, synthetic data, same caveats as the
            Overview page.
          </p>
        </div>
      </footer>
    </>
  );
}
