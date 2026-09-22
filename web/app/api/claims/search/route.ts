import { NextResponse } from "next/server";
import {
  MAX_QUERY_LENGTH,
  MIN_QUERY_LENGTH,
  type ClaimSearchResponse,
  type ClaimSearchResult,
} from "../../../lib/claimSearch";

export const dynamic = "force-dynamic";

const MAX_LIMIT = 25;
const ALLOWED = /^[\p{L}\p{N} &.,'#_\-/()]+$/u;

interface SearchRow {
  claim_id: string;
  submission_date: string;
  service_category: string;
  provider_group: string;
  provider_name: string;
  payer_type: string;
  status: string;
  turnaround_days: number | null;
  billed_amount: number;
  paid_amount: number;
  risk: ClaimSearchResult["risk"];
}

function reply(body: ClaimSearchResponse, status = 200) {
  return NextResponse.json(body, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const requested = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), MAX_LIMIT)
    : MAX_LIMIT;

  if (q.length < MIN_QUERY_LENGTH) return reply({ results: [] });
  if (q.length > MAX_QUERY_LENGTH || !ALLOWED.test(q)) {
    return reply({ results: [], error: "Search text contains unsupported characters." }, 400);
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return reply({ results: [], error: "Claim search is not configured on this deployment." }, 503);
  }

  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
  };
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;

  try {
    const upstream = await fetch(`${url}/rest/v1/rpc/search_claims`, {
      method: "POST",
      headers,
      body: JSON.stringify({ q, lim: limit }),
      cache: "no-store",
    });
    if (!upstream.ok) {
      return reply({ results: [], error: "Search is temporarily unavailable." }, 502);
    }
    const rows = (await upstream.json()) as SearchRow[];
    const results: ClaimSearchResult[] = rows.map((r) => ({
      claimId: r.claim_id,
      submissionDate: r.submission_date,
      serviceCategory: r.service_category,
      providerGroup: r.provider_group,
      providerName: r.provider_name,
      payerType: r.payer_type,
      status: r.status,
      turnaroundDays: r.turnaround_days,
      billedAmount: Number(r.billed_amount),
      paidAmount: Number(r.paid_amount),
      risk: r.risk,
    }));
    return reply({ results });
  } catch {
    return reply({ results: [], error: "Search is temporarily unavailable." }, 502);
  }
}
