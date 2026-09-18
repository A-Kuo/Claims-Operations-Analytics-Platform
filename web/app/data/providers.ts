// Computed from target/claims_ops.duckdb this session:
// - riskBucketCounts: mart_provider_claim_quality, 420 individual providers total.
// - billedAllowedPaidByCategory: fct_claims (is_kpi_eligible), summed by service_category.
// - outlierProviders: mart_provider_claim_quality, min 50 claims, top 8 by denial_rate.
// serviceCategoryStats (claim volume + denial rate by category) is already computed for
// the Overview page in ./claims.ts and reused here rather than duplicated.

export type RiskBucket = "high" | "watch" | "in_control";

export interface RiskBucketCount {
  bucket: RiskBucket;
  label: string;
  count: number;
  tone: "danger" | "warning" | "success";
}

export const riskBucketCounts: RiskBucketCount[] = [
  { bucket: "high", label: "High Risk Providers", count: 61, tone: "danger" },
  { bucket: "watch", label: "Watch List", count: 153, tone: "warning" },
  { bucket: "in_control", label: "In Control", count: 206, tone: "success" },
];

export interface CategoryFinancials {
  category: string;
  billed: number;
  allowed: number;
  paid: number;
}

export const billedAllowedPaidByCategory: CategoryFinancials[] = [
  { category: "Surgery", billed: 70427183, allowed: 47290070, paid: 32364823 },
  { category: "Evaluation & Management", billed: 15354641, allowed: 10285920, paid: 7171599 },
  { category: "Cardiology", billed: 15014940, allowed: 10033462, paid: 7092734 },
  { category: "Radiology", billed: 8521693, allowed: 5701015, paid: 3781405 },
  { category: "Laboratory", billed: 7094459, allowed: 4780212, paid: 3359016 },
  { category: "Emergency", billed: 3920340, allowed: 2633208, paid: 1815364 },
  { category: "Physical Therapy", billed: 3663622, allowed: 2419317, paid: 1661767 },
  { category: "Durable Medical Equipment", billed: 2011484, allowed: 1350707, paid: 951091 },
  { category: "Behavioral Health", billed: 824554, allowed: 558253, paid: 380615 },
  { category: "Infusion", billed: 684980, allowed: 466926, paid: 304750 },
];

export interface OutlierProvider {
  providerName: string;
  providerGroup: string;
  specialty: string;
  claimCount: number;
  denialRate: number;
  reworkRate: number;
  avgTurnaroundDays: number;
  riskBucket: RiskBucket;
}

export const outlierProviders: OutlierProvider[] = [
  { providerName: "Parker Walsh 8", providerGroup: "Summit Orthopedics", specialty: "Orthopedic Surgery", claimCount: 103, denialRate: 51.5, reworkRate: 30.1, avgTurnaroundDays: 12.2, riskBucket: "high" },
  { providerName: "Hayden Patel 2", providerGroup: "Summit Orthopedics", specialty: "Orthopedic Surgery", claimCount: 113, denialRate: 50.4, reworkRate: 31.0, avgTurnaroundDays: 11.6, riskBucket: "high" },
  { providerName: "Avery Bennett 28", providerGroup: "Summit Orthopedics", specialty: "Unknown", claimCount: 106, denialRate: 50.0, reworkRate: 35.8, avgTurnaroundDays: 14.1, riskBucket: "high" },
  { providerName: "Hayden Nguyen 23", providerGroup: "Summit Orthopedics", specialty: "Orthopedic Surgery", claimCount: 103, denialRate: 47.6, reworkRate: 37.9, avgTurnaroundDays: 12.8, riskBucket: "high" },
  { providerName: "Reese Okoye 4", providerGroup: "Summit Orthopedics", specialty: "Orthopedic Surgery", claimCount: 72, denialRate: 45.8, reworkRate: 36.1, avgTurnaroundDays: 11.8, riskBucket: "high" },
  { providerName: "Quinn Patel 6", providerGroup: "Lakeside Imaging", specialty: "Radiology", claimCount: 88, denialRate: 45.5, reworkRate: 30.7, avgTurnaroundDays: 11.8, riskBucket: "high" },
  { providerName: "Reese Singh 12", providerGroup: "Summit Orthopedics", specialty: "Orthopedic Surgery", claimCount: 86, denialRate: 45.3, reworkRate: 38.4, avgTurnaroundDays: 13.3, riskBucket: "high" },
  { providerName: "Quinn Singh 15", providerGroup: "Lakeside Imaging", specialty: "Radiology", claimCount: 82, denialRate: 45.1, reworkRate: 40.2, avgTurnaroundDays: 13.4, riskBucket: "high" },
];
