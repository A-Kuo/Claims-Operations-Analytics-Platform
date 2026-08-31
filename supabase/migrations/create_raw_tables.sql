CREATE TABLE IF NOT EXISTS raw.claim_headers (
    claim_id TEXT PRIMARY KEY,
    member_id TEXT,
    provider_id TEXT,
    payer_id TEXT,
    service_category TEXT,
    billed_amount NUMERIC(14,2),
    header_status_raw TEXT,
    submission_date DATE,
    header_last_updated_at TIMESTAMPTZ,
    source_file TEXT,
    batch_id TEXT,
    ingest_ts TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw.claim_lines (
    claim_line_id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL,
    line_number INTEGER,
    procedure_code TEXT,
    revenue_code TEXT,
    units NUMERIC(12,2),
    line_billed_amount NUMERIC(14,2),
    service_date DATE,
    source_file TEXT,
    batch_id TEXT,
    ingest_ts TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw.claim_events (
    claim_event_id BIGSERIAL PRIMARY KEY,
    claim_id TEXT NOT NULL,
    event_type_raw TEXT NOT NULL,
    event_ts TIMESTAMPTZ NOT NULL,
    denial_reason_code TEXT,
    event_status_raw TEXT,
    source_file TEXT,
    batch_id TEXT,
    ingest_ts TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw.payments (
    payment_id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL,
    payment_date DATE,
    paid_amount NUMERIC(14,2),
    allowed_amount NUMERIC(14,2),
    payment_status TEXT,
    source_file TEXT,
    batch_id TEXT,
    ingest_ts TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw.status_crosswalk (
    status_alias TEXT PRIMARY KEY,
    canonical_status TEXT NOT NULL,
    status_group TEXT
);

CREATE TABLE IF NOT EXISTS raw.event_type_crosswalk (
    event_type_alias TEXT PRIMARY KEY,
    canonical_event_type TEXT NOT NULL,
    event_family TEXT
);