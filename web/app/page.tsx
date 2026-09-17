import TopNav from "./components/TopNav";
import HeaderBar from "./components/HeaderBar";
import MetricCard from "./components/MetricCard";
import TrendChart from "./components/TrendChart";
import CategoryChart from "./components/CategoryChart";
import ClaimRegisterTable from "./components/ClaimRegisterTable";
import { metrics } from "./data/claims";

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas">
      <TopNav />
      <main className="mx-auto max-w-7xl">
        <HeaderBar />

        <section className="grid grid-cols-1 gap-4 px-6 pb-6 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 px-6 pb-6 md:px-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <TrendChart />
          </div>
          <div className="lg:col-span-4">
            <CategoryChart />
          </div>
        </section>

        <section className="px-6 pb-8 md:px-8">
          <ClaimRegisterTable />
        </section>

        <footer className="px-6 pb-10 md:px-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
            <p>
              Every number on this page is computed from the local DuckDB
              claims warehouse (the same marts behind the Streamlit dashboard
              and the repo&apos;s README), exported statically at build time
              — not a live query. A Postgres/Supabase{" "}
              <code className="rounded bg-white px-1.5 py-0.5 text-xs">
                serving
              </code>{" "}
              schema for a real live read is planned but not yet built; the
              existing <code className="rounded bg-white px-1.5 py-0.5 text-xs">raw</code>{" "}
              tables don&apos;t have row-level security policies, so they
              aren&apos;t exposed here. The data itself is synthetic —
              identifiers, providers, and amounts do not represent real
              patients or organizations.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
