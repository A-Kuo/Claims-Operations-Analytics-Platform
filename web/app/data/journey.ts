// Computed from target/claims_ops.duckdb this session:
// - statusFunnel: fct_claims.current_status, is_kpi_eligible only, fixed order
//   (matches dashboards/app.py's funnel ordering, not sorted by volume).
// - eventVolumes: fct_claim_events, all-time counts by event_type.
// - tatHistogram: fct_claims.turnaround_days, bucketed.
// - commonPaths: derived from fct_claims booleans (ever_denied, is_denial_recovered,
//   is_first_pass_resolved, is_open).

export interface StatusCount {
  status: string;
  label: string;
  count: number;
}

export const statusFunnel: StatusCount[] = [
  { status: "submitted", label: "Submitted", count: 349 },
  { status: "in_review", label: "In Review", count: 1030 },
  { status: "pended", label: "Pended", count: 304 },
  { status: "approved", label: "Approved", count: 662 },
  { status: "denied", label: "Denied", count: 8034 },
  { status: "paid", label: "Paid", count: 31197 },
  { status: "voided", label: "Voided", count: 339 },
];

export interface EventVolume {
  eventType: string;
  label: string;
  count: number;
}

export const eventVolumes: EventVolume[] = [
  { eventType: "claim_received", label: "Claim Received", count: 42599 },
  { eventType: "claim_submitted", label: "Claim Submitted", count: 42000 },
  { eventType: "claim_approved", label: "Claim Approved", count: 31920 },
  { eventType: "payment_issued", label: "Payment Issued", count: 31257 },
  { eventType: "claim_denied", label: "Claim Denied", count: 12040 },
  { eventType: "claim_pended", label: "Claim Pended", count: 6945 },
  { eventType: "additional_info_requested", label: "Info Requested", count: 6380 },
  { eventType: "claim_resubmitted", label: "Claim Resubmitted", count: 3984 },
  { eventType: "payment_adjusted", label: "Payment Adjusted", count: 597 },
  { eventType: "claim_voided", label: "Claim Voided", count: 351 },
];

export interface TatBucket {
  bucket: string;
  count: number;
}

export const tatHistogram: TatBucket[] = [
  { bucket: "0-7 days", count: 12147 },
  { bucket: "8-14 days", count: 18060 },
  { bucket: "15-21 days", count: 5684 },
  { bucket: "22-30 days", count: 3183 },
  { bucket: "31+ days", count: 1219 },
  { bucket: "Still open", count: 1622 },
];

export interface PathOutcome {
  path: string;
  count: number;
}

export const commonPaths: PathOutcome[] = [
  { path: "Approved first pass", count: 24845 },
  { path: "Denied → not recovered", count: 8034 },
  { path: "Approved after rework", count: 4952 },
  { path: "Denied → recovered", count: 2401 },
  { path: "Still open", count: 1683 },
];
