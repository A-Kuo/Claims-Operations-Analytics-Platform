"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import RiskBadge from "../components/RiskBadge";
import {
  MIN_QUERY_LENGTH,
  type ClaimSearchResponse,
  type ClaimSearchResult,
} from "../lib/claimSearch";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function SearchResults() {
  const q = (useSearchParams().get("q") ?? "").trim();
  const searchable = q.length >= MIN_QUERY_LENGTH;
  const [results, setResults] = useState<ClaimSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!searchable) {
      setResults([]);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/claims/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then(async (res) => {
        const body = (await res.json()) as ClaimSearchResponse;
        if (!res.ok) throw new Error(body.error ?? "Search is temporarily unavailable.");
        setResults(body.results);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setResults([]);
        setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [q, searchable]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900">
          {searchable ? <>Results for &ldquo;{q}&rdquo;</> : "Search claims"}
        </h3>
        <p className="text-sm text-slate-500" aria-live="polite">
          {!searchable && "Enter a claim ID, provider name or group, or service category (at least 2 characters)."}
          {searchable && loading && "Searching…"}
          {searchable && !loading && !error && `${results.length} shown${results.length === 25 ? " (limit 25 — narrow your search)" : ""}`}
          {searchable && !loading && error && <span className="text-rose-600">{error}</span>}
        </p>
      </div>

      {searchable && !loading && !error && results.length === 0 && (
        <p className="p-6 text-sm text-slate-500">
          No claims match. Try a full claim ID such as <span className="font-mono">CLM-2025-0000003</span>, a provider
          group such as <span className="font-medium">Summit Orthopedics</span>, or a category such as{" "}
          <span className="font-medium">Radiology</span>.
        </p>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Claim ID</th>
                <th className="px-6 py-3 font-medium">Submitted</th>
                <th className="px-6 py-3 font-medium">Provider</th>
                <th className="px-6 py-3 font-medium">Service</th>
                <th className="px-6 py-3 font-medium">Payer</th>
                <th className="px-6 py-3 font-medium">Billed</th>
                <th className="px-6 py-3 font-medium">Paid</th>
                <th className="px-6 py-3 font-medium">TAT</th>
                <th className="px-6 py-3 font-medium">Risk</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((c) => (
                <tr
                  key={c.claimId}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-6 py-3.5 font-mono text-xs text-slate-500">{c.claimId}</td>
                  <td className="px-6 py-3.5 tabular-nums text-slate-600">{formatDate(c.submissionDate)}</td>
                  <td className="px-6 py-3.5 text-slate-600">
                    <span className="block font-medium text-slate-700">{c.providerName}</span>
                    <span className="block text-xs text-slate-500">{c.providerGroup}</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{c.serviceCategory}</td>
                  <td className="px-6 py-3.5 text-slate-600">{c.payerType}</td>
                  <td className="px-6 py-3.5 tabular-nums text-slate-600">{money.format(c.billedAmount)}</td>
                  <td className="px-6 py-3.5 tabular-nums text-slate-600">{money.format(c.paidAmount)}</td>
                  <td className="px-6 py-3.5 tabular-nums text-slate-600">
                    {c.turnaroundDays !== null ? `${c.turnaroundDays} days` : "—"}
                  </td>
                  <td className="px-6 py-3.5">
                    <RiskBadge risk={c.risk} />
                  </td>
                  <td className="px-6 py-3.5 capitalize text-slate-600">{c.status.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
