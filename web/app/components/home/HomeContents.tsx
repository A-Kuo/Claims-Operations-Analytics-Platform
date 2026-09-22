import {
  ArrowRight,
  Database,
  FileWarning,
  Github,
  Layers,
  LayoutDashboard,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { GITHUB_REPO_URL } from "../../lib/links";

const STATS = [
  { value: "41,915", label: "KPI-eligible claims" },
  { value: "178,073", label: "lifecycle events rebuilt into claim status" },
  { value: "5 · 6 · 11", label: "fact tables, dimensions, and KPI marts" },
  { value: "83", label: "automated dbt tests, gated in CI" },
];

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: FileWarning,
    title: "1. Extract",
    body: "A generator produces claim headers, lines, and lifecycle events with the defects real extracts have: duplicate reloads, mixed date formats, status aliases, invalid amounts, and missing IDs.",
  },
  {
    icon: Layers,
    title: "2. Model",
    body: "dbt on DuckDB cleans and standardizes the extracts, then builds a star schema. A claim's status comes from its latest event, not the unreliable status column on the header.",
  },
  {
    icon: ShieldCheck,
    title: "3. Test",
    body: "83 dbt tests check keys, relationships, accepted values, and status logic on every push. Defects are flagged and kept visible instead of silently dropped.",
  },
  {
    icon: Database,
    title: "4. Serve",
    body: "Marts feed this site and a Streamlit dashboard. A Supabase Postgres table backs claim search, locked down with row-level security.",
  },
];

const PAGES = [
  {
    href: "/overview",
    title: "Overview",
    body: "Headline KPIs, weekly submission and adjudication trend, and claim volume by service category.",
  },
  {
    href: "/denials-rework",
    title: "Denials & Rework",
    body: "Top denial reasons, rework and recovery rates, and the provider groups that drive denials.",
  },
  {
    href: "/provider-service",
    title: "Provider & Service",
    body: "Provider risk buckets, outlier providers, and billed versus allowed versus paid by service category.",
  },
  {
    href: "/claim-journey",
    title: "Claim Journey",
    body: "Current-status funnel, lifecycle event volume, turnaround against the 14-day SLA, and outcome paths.",
  },
];

export default function HomeContents() {
  return (
    <>
      <section className="px-6 pb-10 pt-12 md:px-8 md:pt-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          Claims Operations Analytics Platform
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          Turning a messy claims extract into decisions operations teams can act on.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-500">
          ClaimPulse models the full claims lifecycle, from submission through adjudication and
          payment, and turns raw operational events into tested KPIs for backlog, denials,
          turnaround time, and provider performance.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/overview"
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-card-hover hover:bg-sky-700"
          >
            Open the dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-card hover:bg-slate-50"
          >
            <Github className="h-4 w-4" />
            View the code
          </a>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 px-6 pb-12 md:px-8 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="text-2xl font-bold tabular-nums tracking-tight text-slate-900">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="px-6 pb-12 md:px-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">The problem</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
          Northstar Health Plan, the fictional payer in this project, promises a 14-day first-pass
          adjudication SLA and a 7-day payment SLA. Examiners still work from status lists that mix
          aliases like <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">APPR</code> and{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm">adj-denied</code>, duplicate
          extract reloads, and header dates that disagree with the event log. Backlog hides in
          &ldquo;in review,&rdquo; authorization denials keep recycling through the same providers, and one
          payer&rsquo;s payment lag sits far above target. This project rebuilds the truth from the event
          log and makes those problems measurable.
        </p>
      </section>

      <section className="px-6 pb-12 md:px-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">How it works</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-12 md:px-8">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">What you can explore</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-sky-600" />
                <h3 className="font-semibold text-slate-900">{page.title}</h3>
                <ArrowRight className="ml-auto h-4 w-4 text-slate-300 transition-colors group-hover:text-sky-600" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{page.body}</p>
            </Link>
          ))}
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm text-slate-500">
          <Search className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
          Use the search bar at the top to look up individual claims by ID, provider, or service category.
        </p>
      </section>

      <section className="px-6 pb-14 md:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="font-semibold text-slate-900">What is real, and what is not</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
            <li>
              <span className="font-medium text-slate-800">The data is synthetic.</span> Members, providers,
              payers, and amounts are generated and do not represent real people or organizations.
            </li>
            <li>
              <span className="font-medium text-slate-800">There is no machine learning here.</span> Risk
              tiers, SLA breaches, and denial flags are deterministic SQL rules in dbt.
            </li>
            <li>
              <span className="font-medium text-slate-800">Most charts are static exports.</span> Dashboard
              figures are computed from the DuckDB warehouse and bundled at build time. Claim search is the
              live piece, reading from Supabase.
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
