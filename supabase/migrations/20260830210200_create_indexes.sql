create index if not exists idx_claim_headers_submission_date
    on raw.claim_headers (submission_date);

create index if not exists idx_claim_headers_provider_id
    on raw.claim_headers (provider_id);

create index if not exists idx_claim_headers_payer_id
    on raw.claim_headers (payer_id);

create index if not exists idx_claim_lines_claim_id
    on raw.claim_lines (claim_id);

create index if not exists idx_claim_events_claim_id
    on raw.claim_events (claim_id);

create index if not exists idx_claim_events_claim_id_event_ts
    on raw.claim_events (claim_id, event_ts desc);

create index if not exists idx_claim_events_event_ts
    on raw.claim_events (event_ts);

create index if not exists idx_payments_claim_id
    on raw.payments (claim_id);

create index if not exists idx_payments_payment_date
    on raw.payments (payment_date);
