"use client";

import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  MAX_QUERY_LENGTH,
  MIN_QUERY_LENGTH,
  type ClaimSearchResponse,
  type ClaimSearchResult,
} from "../lib/claimSearch";
import RiskBadge from "./RiskBadge";

const PREVIEW_COUNT = 6;

type Status = "idle" | "loading" | "done" | "error";

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<ClaimSearchResult[]>([]);
  const [message, setMessage] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const searchable = trimmed.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!searchable) {
      setStatus("idle");
      setResults([]);
      return;
    }
    setStatus("loading");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/claims/search?limit=${PREVIEW_COUNT}&q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        const body = (await res.json()) as ClaimSearchResponse;
        if (!res.ok) {
          setMessage(body.error ?? "Search is temporarily unavailable.");
          setResults([]);
          setStatus("error");
          return;
        }
        setResults(body.results);
        setStatus("done");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setMessage("Search is temporarily unavailable.");
        setStatus("error");
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, searchable]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function goToResults(text: string) {
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(text)}`);
  }

  return (
    <div ref={wrapperRef} className="relative hidden lg:block">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (searchable) goToResults(trimmed);
        }}
        className="flex w-64 items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 text-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-sky-200"
      >
        <Search className="h-4 w-4 shrink-0" />
        <input
          type="search"
          value={query}
          maxLength={MAX_QUERY_LENGTH}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter") {
              e.preventDefault();
              if (searchable) goToResults(trimmed);
            }
          }}
          placeholder="Search claims…"
          aria-label="Search claims"
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </form>

      {open && searchable && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[26rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover">
          {status === "loading" && (
            <p className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </p>
          )}
          {status === "error" && (
            <p className="px-4 py-3 text-sm text-rose-600">{message}</p>
          )}
          {status === "done" && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-500">
              No claims match &ldquo;{trimmed}&rdquo;. Try a claim ID, provider group, or service category.
            </p>
          )}
          {status === "done" && results.length > 0 && (
            <>
              <ul className="divide-y divide-slate-100">
                {results.map((r) => (
                  <li key={r.claimId}>
                    <Link
                      href={`/search?q=${encodeURIComponent(r.claimId)}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="block font-mono text-xs text-slate-700">{r.claimId}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {r.providerGroup} · {r.serviceCategory}
                        </span>
                      </span>
                      <RiskBadge risk={r.risk} />
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => goToResults(trimmed)}
                className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-medium text-sky-700 hover:bg-slate-50"
              >
                See all results for &ldquo;{trimmed}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
