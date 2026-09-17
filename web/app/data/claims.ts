// All figures below are computed from the local DuckDB claims warehouse
// (target/claims_ops.duckdb), the same marts that feed the Streamlit
// dashboard and the README's Top KPIs table. This is a static export, not a
// live query — see the note in app/page.tsx for why (the Supabase `serving`
// schema this would eventually read from is still an empty placeholder).

export type MetricTone = "success" | "warning" | "danger" | "neutral";

export interface Metric {
  label: string;
  value: string;
  badge: string;
  tone: MetricTone;
}

export const metrics: Metric[] = [
  {
    label: "KPI-Eligible Claims",
    value: "41,915",
    badge: "of 42,000 submitted",
    tone: "neutral",
  },
  {
    label: "SLA Breach Rate",
    value: "24.4%",
    badge: "+1.8pp vs prior week",
    tone: "warning",
  },
  {
    label: "Avg. Turnaround",
    value: "11.8 days",
    badge: "3.2 days under 14-day SLA",
    tone: "success",
  },
  {
    label: "Payment Lag",
    value: "12.5 days",
    badge: "5.5 days over 7-day SLA",
    tone: "danger",
  },
];

// Weekly claims_submitted / claims_adjudicated / sla_breaches, summed from
// mart_claims_overview_daily, for the 12 most recent complete weeks
// (the partial in-progress week is excluded so the trend doesn't taper off
// artificially at the end).
export interface WeeklyTrendPoint {
  weekStart: string;
  submitted: number;
  adjudicated: number;
  breaches: number;
}

export const weeklyTrend: WeeklyTrendPoint[] = [
  { weekStart: "2026-05-25", submitted: 529, adjudicated: 526, breaches: 134 },
  { weekStart: "2026-06-01", submitted: 519, adjudicated: 513, breaches: 124 },
  { weekStart: "2026-06-08", submitted: 506, adjudicated: 533, breaches: 139 },
  { weekStart: "2026-06-15", submitted: 486, adjudicated: 521, breaches: 122 },
  { weekStart: "2026-06-22", submitted: 506, adjudicated: 497, breaches: 131 },
  { weekStart: "2026-06-29", submitted: 560, adjudicated: 509, breaches: 111 },
  { weekStart: "2026-07-06", submitted: 512, adjudicated: 512, breaches: 129 },
  { weekStart: "2026-07-13", submitted: 525, adjudicated: 538, breaches: 115 },
  { weekStart: "2026-07-20", submitted: 523, adjudicated: 517, breaches: 125 },
  { weekStart: "2026-07-27", submitted: 516, adjudicated: 524, breaches: 145 },
  { weekStart: "2026-08-03", submitted: 509, adjudicated: 537, breaches: 161 },
  { weekStart: "2026-08-10", submitted: 543, adjudicated: 453, breaches: 144 },
];

// Claim volume and denial rate by service_category, from fct_claims
// (is_kpi_eligible = true), ordered by volume.
export interface ServiceCategoryStat {
  category: string;
  claimCount: number;
  denialRate: number;
}

export const serviceCategoryStats: ServiceCategoryStat[] = [
  { category: "Evaluation & Management", claimCount: 15428, denialRate: 24.1 },
  { category: "Laboratory", claimCount: 8443, denialRate: 22.2 },
  { category: "Radiology", claimCount: 3639, denialRate: 35.4 },
  { category: "Surgery", claimCount: 3240, denialRate: 28.8 },
  { category: "Cardiology", claimCount: 3202, denialRate: 22.6 },
  { category: "Physical Therapy", claimCount: 2734, denialRate: 27.9 },
  { category: "Behavioral Health", claimCount: 1767, denialRate: 22.6 },
  { category: "Emergency", claimCount: 1435, denialRate: 23.0 },
  { category: "Durable Medical Equipment", claimCount: 1243, denialRate: 22.9 },
  { category: "Infusion", claimCount: 784, denialRate: 22.4 },
];

// A representative sample of individual claims (fct_claims joined to
// dim_provider), one drawn per risk tier per week across a recent 8-week
// window, selected by a deterministic hash rather than "most recent" so the
// dates aren't all clustered on one heavy intake day.
export type RiskTier = "low" | "elevated" | "critical";

export interface ClaimRow {
  claimId: string;
  submissionDate: string;
  serviceCategory: string;
  providerGroup: string;
  status: string;
  turnaroundDays: number | null;
  risk: RiskTier;
}

export const claimRegister: ClaimRow[] = [
  { claimId: "CLM-2026-0038042", submissionDate: "2026-07-27", serviceCategory: "Surgery", providerGroup: "Valley Surgical Associates", status: "denied", turnaroundDays: 11, risk: "elevated" },
  { claimId: "CLM-2026-0025547", submissionDate: "2026-07-26", serviceCategory: "Evaluation & Management", providerGroup: "Cedar Pediatrics", status: "denied", turnaroundDays: 9, risk: "elevated" },
  { claimId: "CLM-2026-0039466", submissionDate: "2026-07-24", serviceCategory: "Laboratory", providerGroup: "Greenfield Primary Care", status: "denied", turnaroundDays: 21, risk: "critical" },
  { claimId: "CLM-2026-0010357", submissionDate: "2026-07-18", serviceCategory: "Infusion", providerGroup: "Northwind Infusion Center", status: "paid", turnaroundDays: 11, risk: "low" },
  { claimId: "CLM-2026-0040586", submissionDate: "2026-07-11", serviceCategory: "Behavioral Health", providerGroup: "Harbor Behavioral Health", status: "paid", turnaroundDays: 22, risk: "critical" },
  { claimId: "CLM-2026-0014791", submissionDate: "2026-07-08", serviceCategory: "Surgery", providerGroup: "Summit Orthopedics", status: "paid", turnaroundDays: 11, risk: "low" },
  { claimId: "CLM-2026-0011171", submissionDate: "2026-07-08", serviceCategory: "Emergency", providerGroup: "West Independent Practice 16", status: "paid", turnaroundDays: 5, risk: "low" },
  { claimId: "CLM-2026-0039198", submissionDate: "2026-06-30", serviceCategory: "Radiology", providerGroup: "Lakeside Imaging", status: "denied", turnaroundDays: 10, risk: "elevated" },
  { claimId: "CLM-2026-0041923", submissionDate: "2026-06-18", serviceCategory: "Cardiology", providerGroup: "Riverside Cardiology", status: "denied", turnaroundDays: 7, risk: "elevated" },
  { claimId: "CLM-2026-0021076", submissionDate: "2026-06-14", serviceCategory: "Behavioral Health", providerGroup: "Harbor Behavioral Health", status: "paid", turnaroundDays: 34, risk: "critical" },
  { claimId: "CLM-2026-0017245", submissionDate: "2026-06-08", serviceCategory: "Evaluation & Management", providerGroup: "Coastal Independent Practice 3", status: "paid", turnaroundDays: 27, risk: "critical" },
  { claimId: "CLM-2026-0006517", submissionDate: "2026-06-03", serviceCategory: "Laboratory", providerGroup: "Greenfield Primary Care", status: "paid", turnaroundDays: 11, risk: "low" },
];
