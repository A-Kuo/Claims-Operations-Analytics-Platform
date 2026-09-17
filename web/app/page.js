const REPO_URL =
  "https://github.com/A-Kuo/Claims-Operations-Analytics-Platform";

const KPIS = [
  { label: "KPI-eligible claims", value: "41,915" },
  { label: "Raw event log rows", value: "178,073" },
  { label: "Average turnaround", value: "11.8 days" },
  { label: "SLA breach rate", value: "24.4%" },
  { label: "Denial rate", value: "25.0%" },
  { label: "First-pass resolution", value: "59.3%" },
  { label: "Payment lag", value: "12.5 days" },
  { label: "Paid-to-billed (paid claims)", value: "63.2%" },
];

const SCREENSHOTS = [
  "https://github.com/user-attachments/assets/1d3e4e71-0d0c-4112-92f9-891e763d64a8",
  "https://github.com/user-attachments/assets/7359ec87-0653-4b5f-a2cf-6b709b111376",
  "https://github.com/user-attachments/assets/0846881c-cb95-4999-ab8a-10a4481eccd7",
  "https://github.com/user-attachments/assets/31310110-9631-4873-b2e5-65de0fb0b44e",
];

export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Claims Operations Analytics Platform</p>
        <h1>Rebuilding true claim status from a messy event log.</h1>
        <p className="lede">
          Claims examiners work off a status field that mixes aliases,
          duplicate extract reloads, and header dates that disagree with the
          event log. This platform reconstructs true claim state from a
          178,073-row raw event log instead, and exposes backlog, denial, and
          payment-lag risk against a 14-day adjudication SLA.
        </p>
        <a className="cta" href={REPO_URL}>
          View the repository →
        </a>
      </header>

      <section className="section">
        <h2>Top KPIs</h2>
        <div className="kpi-grid">
          {KPIS.map((kpi) => (
            <div className="kpi-card" key={kpi.label}>
              <span className="kpi-value">{kpi.value}</span>
              <span className="kpi-label">{kpi.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Stack</h2>
        <p>
          dbt Core and DuckDB, structured as a denormalized star schema of 5
          facts, 6 dimensions, and 11 KPI marts, feeding a Streamlit
          dashboard. Every mart is backed by 83 dbt tests, CI-gated on every
          push and pull request.
        </p>
      </section>

      <section className="section">
        <h2>Migration status</h2>
        <p>
          The DuckDB and dbt pipeline is stable — it is the live source for
          every KPI and dashboard number shown above. A Postgres/Supabase
          ingestion layer is real and running alongside it: schema
          migrations, seed crosswalks, and a load path are applied to a live
          Supabase project, and a DuckDB <code>postgres</code> extension
          ATTACH lets dbt read from it directly, proven end to end in CI.
        </p>
        <p>
          This page is the newest piece. It does not read live data from
          Supabase yet — the <code>serving</code> schema meant to expose safe,
          public KPI data is still an empty, reserved placeholder, and the
          existing <code>raw</code> tables do not have row-level security
          policies, so they should not be exposed to a public frontend as-is.
          A live dashboard here is the next phase, once that layer is
          actually built out.
        </p>
      </section>

      <section className="section">
        <h2>Screenshots</h2>
        <p>From the local Streamlit dashboard, the current source of truth.</p>
        <div className="screenshot-grid">
          {SCREENSHOTS.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="Dashboard screenshot" />
          ))}
        </div>
      </section>

      <footer className="footer">
        <p>
          The data is synthetic. Identifiers, providers, payers, and amounts
          do not represent real patients or organizations.
        </p>
      </footer>
    </main>
  );
}
