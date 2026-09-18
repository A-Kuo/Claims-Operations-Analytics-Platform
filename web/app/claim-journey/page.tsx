import PageHeader from "../components/PageHeader";
import StatusFunnelChart from "../components/StatusFunnelChart";
import EventVolumeChart from "../components/EventVolumeChart";
import TatHistogramChart from "../components/TatHistogramChart";
import PathsTable from "../components/PathsTable";
import { eventVolumes } from "../data/journey";

export default function ClaimJourneyPage() {
  return (
    <>
      <PageHeader
        title="Claim Journey"
        subtitle="How claims move through submission, adjudication, and payment"
        exportFilename="lifecycle_events.csv"
        exportHeaders={["event_type", "label", "count"]}
        exportRows={eventVolumes.map((e) => [e.eventType, e.label, e.count])}
      />

      <section className="grid grid-cols-1 gap-4 px-6 pb-6 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <StatusFunnelChart />
        </div>
        <div className="lg:col-span-6">
          <EventVolumeChart />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 px-6 pb-6 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <TatHistogramChart />
        </div>
        <div className="lg:col-span-6">
          <PathsTable />
        </div>
      </section>

      <footer className="px-6 pb-10 md:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          <p>
            Status and event data come from{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              fct_claims.current_status
            </code>{" "}
            and{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">
              fct_claim_events
            </code>
            . Outcome paths are derived from the same lifecycle flags that
            drive every KPI on this site. Static export, synthetic data, same
            caveats as the Overview page.
          </p>
        </div>
      </footer>
    </>
  );
}
