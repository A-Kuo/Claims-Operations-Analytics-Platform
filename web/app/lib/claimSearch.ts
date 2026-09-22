export type SearchRisk = "low" | "elevated" | "critical";

export interface ClaimSearchResult {
  claimId: string;
  submissionDate: string;
  serviceCategory: string;
  providerGroup: string;
  providerName: string;
  payerType: string;
  status: string;
  turnaroundDays: number | null;
  billedAmount: number;
  paidAmount: number;
  risk: SearchRisk;
}

export interface ClaimSearchResponse {
  results: ClaimSearchResult[];
  error?: string;
}

export const MIN_QUERY_LENGTH = 2;
export const MAX_QUERY_LENGTH = 64;
