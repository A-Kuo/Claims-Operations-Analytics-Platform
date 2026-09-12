with source as (
    select * from {{ source('postgres_raw', 'claim_headers') }}
),

typed as (
    select
        header_id,
        trim(claim_id) as claim_id,
        nullif(trim(member_id), '') as member_id,
        trim(provider_id) as provider_id,
        trim(payer_id) as payer_id,
        trim(service_category) as service_category,
        try_cast(billed_amount as decimal(18, 2)) as billed_amount,
        trim(header_status_raw) as header_status_raw,
        try_cast(submission_date as date) as submission_date,
        try_cast(header_last_updated_at as timestamp) as header_last_updated_at,
        trim(source_file) as source_file,
        trim(batch_id) as batch_id,
        try_cast(ingest_ts as timestamp) as ingest_ts
    from source
)

select
    header_id,
    claim_id,
    coalesce(member_id, '{{ var("unknown_member_id") }}') as member_id,
    provider_id,
    payer_id,
    service_category,
    billed_amount,
    header_status_raw,
    submission_date,
    header_last_updated_at,
    source_file,
    batch_id,
    ingest_ts,
    count(*) over (partition by claim_id) as extract_copy_count
from typed
where claim_id is not null and claim_id <> ''
