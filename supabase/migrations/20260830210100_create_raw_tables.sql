create table if not exists raw.claim_headers (
    claim_id text primary key,
    member_id text,
    provider_id text,
    payer_id text,
    service_category text,
    billed_amount numeric(14,2),
    header_status_raw text,
    submission_date date,
    header_last_updated_at timestamptz,
    source_file text,
    batch_id text,
    ingest_ts timestamptz default now()
);

create table if not exists raw.claim_lines (
    claim_line_id text primary key,
    claim_id text not null,
    line_number integer,
    procedure_code text,
    revenue_code text,
    units numeric(12,2),
    line_billed_amount numeric(14,2),
    service_date date,
    source_file text,
    batch_id text,
    ingest_ts timestamptz default now()
);

create table if not exists raw.claim_events (
    claim_event_id bigserial primary key,
    claim_id text not null,
    event_type_raw text not null,
    event_ts timestamptz not null,
    denial_reason_code text,
    event_status_raw text,
    source_file text,
    batch_id text,
    ingest_ts timestamptz default now()
);

create table if not exists raw.payments (
    payment_id text primary key,
    claim_id text not null,
    payment_date date,
    paid_amount numeric(14,2),
    allowed_amount numeric(14,2),
    payment_status text,
    source_file text,
    batch_id text,
    ingest_ts timestamptz default now()
);

create table if not exists raw.status_crosswalk (
    status_alias text primary key,
    canonical_status text not null,
    status_group text
);

create table if not exists raw.event_type_crosswalk (
    event_type_alias text primary key,
    canonical_event_type text not null,
    event_family text
);
