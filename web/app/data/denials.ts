// Computed from target/claims_ops.duckdb this session:
// - denialMetrics: fct_claims booleans (ever_denied, is_rework, is_first_pass_resolved,
//   is_denial_recovered), is_kpi_eligible only.
// - topDenialReasons: fct_denials joined to dim_denial_reason, all-time event counts.
// - providerGroupDenialRates: mart_provider_performance, groups with >= 5 providers,
//   top 8 by denial_rate.

export interface DenialMetric {
  label: string;
  value: string;
  badge: string;
  tone: "success" | "warning" | "danger" | "neutral";
}

export const denialMetrics: DenialMetric[] = [
  { label: "Denial Rate", value: "25.0%", badge: "of KPI-eligible claims", tone: "neutral" },
  { label: "Rework Rate", value: "24.5%", badge: "pended, resubmitted, or flagged", tone: "warning" },
  { label: "First-Pass Resolution", value: "59.3%", badge: "approved or paid, no rework", tone: "success" },
  { label: "Denial Recovery Rate", value: "22.9%", badge: "of denied claims later recovered", tone: "neutral" },
];

export interface DenialReason {
  code: string;
  description: string;
  category: string;
  events: number;
}

export const topDenialReasons: DenialReason[] = [
  { code: "CO-4", description: "Missing modifier", category: "Coding", events: 1431 },
  { code: "CO-16", description: "Claim lacks information", category: "Documentation", events: 1412 },
  { code: "CO-197", description: "Precertification/authorization absent", category: "Authorization", events: 1392 },
  { code: "CO-204", description: "Service not authorized", category: "Authorization", events: 1216 },
  { code: "CO-B7", description: "Provider not eligible to bill this service", category: "Provider", events: 864 },
  { code: "CO-22", description: "Coordination of benefits", category: "Eligibility", events: 860 },
];

export type RiskBucket = "high" | "watch" | "in_control";

export interface ProviderGroupDenial {
  providerGroup: string;
  specialty: string;
  providerCount: number;
  claimCount: number;
  denialRate: number;
  riskBucket: RiskBucket;
}

export const providerGroupDenialRates: ProviderGroupDenial[] = [
  { providerGroup: "Lakeside Imaging", specialty: "Radiology", providerCount: 21, claimCount: 2037, denialRate: 39.9, riskBucket: "high" },
  { providerGroup: "Summit Orthopedics", specialty: "Orthopedic Surgery", providerCount: 25, claimCount: 2481, denialRate: 39.6, riskBucket: "high" },
  { providerGroup: "Metro Emergency Physicians", specialty: "Emergency Medicine", providerCount: 35, claimCount: 3562, denialRate: 26.7, riskBucket: "watch" },
  { providerGroup: "Valley Surgical Associates", specialty: "General Surgery", providerCount: 20, claimCount: 1952, denialRate: 25.2, riskBucket: "watch" },
  { providerGroup: "Lumen Physical Therapy", specialty: "Physical Therapy", providerCount: 16, claimCount: 1614, denialRate: 23.9, riskBucket: "in_control" },
  { providerGroup: "Prairie DME Supply", specialty: "Durable Medical Equipment", providerCount: 9, claimCount: 939, denialRate: 23.5, riskBucket: "in_control" },
  { providerGroup: "Riverside Cardiology", specialty: "Cardiology", providerCount: 23, claimCount: 2312, denialRate: 22.9, riskBucket: "in_control" },
  { providerGroup: "Cedar Pediatrics", specialty: "Pediatrics", providerCount: 11, claimCount: 1033, denialRate: 22.8, riskBucket: "in_control" },
];
