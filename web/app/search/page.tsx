import { Suspense } from "react";
import SearchResults from "./SearchResults";

export const metadata = { title: "Search claims · ClaimPulse Analytics" };

export default function SearchPage() {
  return (
    <>
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Claim Search</h1>
        <p className="mt-1 text-sm text-slate-500">
          Look up individual claims by ID, provider, or service category
        </p>
      </div>

      <section className="px-6 pb-8 md:px-8">
        <Suspense fallback={null}>
          <SearchResults />
        </Suspense>
      </section>

      <footer className="px-6 pb-10 md:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          <p>
            Search runs against a Supabase table loaded from the same{" "}
            <code className="rounded bg-white px-1.5 py-0.5 text-xs">fct_claims</code> mart that
            feeds every chart on this site (KPI-eligible claims only). The table is locked
            down with row-level security and reachable only through one capped, read-only
            function. All claims, providers, and amounts are synthetic.
          </p>
        </div>
      </footer>
    </>
  );
}
