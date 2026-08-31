CREATE INDEX IF NOT EXISTS idx_claim_headers_submission_date
    ON raw.claim_headers (submission_date);

CREATE INDEX IF NOT EXISTS idx_claim_headers_provider_id
    ON raw.claim_headers (provider_id);

CREATE INDEX IF NOT EXISTS idx_claim_headers_payer_id
    ON raw.claim_headers (payer_id);

CREATE INDEX IF NOT EXISTS idx_claim_lines_claim_id
    ON raw.claim_lines (claim_id);

CREATE INDEX IF NOT EXISTS idx_claim_events_claim_id_event_ts
    ON raw.claim_events (claim_id, event_ts DESC);

CREATE INDEX IF NOT EXISTS idx_claim_events_event_ts
    ON raw.claim_events (event_ts);

CREATE INDEX IF NOT EXISTS idx_payments_claim_id
    ON raw.payments (claim_id);