import PageHeader from "../components/PageHeader";
import RiskBucketCards from "../components/RiskBucketCards";
import BilledAllowedPaidChart from "../components/BilledAllowedPaidChart";
import OutlierProviderTable from "../components/OutlierProviderTable";
import { outlierProviders } from "../data/providers";

export default function ProviderServicePage() {
  return (
    <>
      <PageHeader
        title="Provider & Service"
        subtitle="Provider risk buckets and billed-to-paid gaps by service category"
        exportFilename="outlier_providers.csv"
        exportHeaders={[
          "provider_name",
          "provider_group",
          "specialty",
          "claim_count",
          "denial_rate",
          "rework_rate",
          "avg_turnaround_days",
          "risk_bucket",
        ]}
        exportRows={outlierProviders.map((p) => [
          p.providerName,
          p.providerGroup,
          p.specialty,
          p.claimCount,
          p.denialRate,
          p.reworkRate,
          p.avgTurnaroundDays,
          p.riskBucket,
        ])}
      />

      <section className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-3 md:px-8">
        <RiskBucketCards />
      </section>

      <section className="px-6 pb-6 md:px-8">
        <BilledAllowedPaidChart />
      </section>

      <section className="px-6 pb-8 md:px-8">
        <OutlierProviderTable />
      </section>

      <footer className="px-6 pb-10 md:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          <p>
            Risk buckets and outlier providers come from{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              mart_provider_claim_quality
            </code>{" "}
            (420 individual providers); billed/allowed/paid totals are summed
            from{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              fct_claims
            </code>
            . Static export, synthetic data, same caveats as the Overview
            page.
          </p>
        </div>
      </footer>
    </>
  );
}
