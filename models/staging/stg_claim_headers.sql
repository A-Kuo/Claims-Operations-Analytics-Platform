with source as (
    select * from {{ source('raw', 'raw_claim_headers') }}
),

typed as (
    select
        trim(claim_id) as claim_id,
        nullif(trim(member_id), '') as member_id,
        trim(provider_id) as provider_id,
        trim(payer_id) as payer_id,
        trim(payer_name) as payer_name,
        trim(payer_type) as payer_type,
        {{ parse_mixed_date('service_date') }} as service_date,
        {{ parse_mixed_date('submission_date') }} as submission_date,
        {{ parse_mixed_date('adjudication_date') }} as header_adjudication_date,
        {{ parse_mixed_date('payment_date') }} as header_payment_date,
        try_cast(billed_amount as decimal(18, 2)) as billed_amount,
        try_cast(allowed_amount as decimal(18, 2)) as allowed_amount,
        try_cast(paid_amount as decimal(18, 2)) as paid_amount,
        trim(claim_status) as raw_claim_status,
        trim(diagnosis_group) as diagnosis_group,
        trim(cast(place_of_service as varchar)) as place_of_service,
        trim(cast(rework_flag as varchar)) as raw_rework_flag,
        trim(primary_service_category) as primary_service_category,
        try_cast(ingest_ts as timestamp) as ingest_ts,
        trim(source_file) as source_file
    from source
),

normalized as (
    select
        typed.*,
        coalesce(status.canonical_status, 'unknown') as claim_status,
        coalesce(status.status_family, 'unknown') as status_family,
        case
            when lower(coalesce(typed.raw_rework_flag, '')) in ('y', '1', 'true', 'yes') then true
            when lower(coalesce(typed.raw_rework_flag, '')) in ('n', '0', 'false', 'no', '') then false
        end as header_rework_flag,
        typed.billed_amount is null or typed.billed_amount < 0 as has_invalid_billed_amount,
        typed.member_id is null as has_missing_member_id,
        typed.paid_amount is not null
            and typed.billed_amount is not null
            and typed.billed_amount > 0
            and typed.paid_amount > typed.billed_amount as has_paid_gt_billed
    from typed
    left join {{ ref('status_crosswalk') }} as status
        on typed.raw_claim_status = status.raw_status
),

ranked as (
    select
        *,
        count(*) over (partition by claim_id) as extract_copy_count,
        row_number() over (partition by claim_id order by ingest_ts desc) as extract_row_number
    from normalized
    where claim_id is not null and claim_id <> ''
)

select
    claim_id,
    coalesce(member_id, '{{ var("unknown_member_id") }}') as member_id,
    provider_id,
    payer_id,
    payer_name,
    payer_type,
    service_date,
    submission_date,
    header_adjudication_date,
    header_payment_date,
    billed_amount,
    allowed_amount,
    paid_amount,
    raw_claim_status,
    claim_status,
    status_family,
    diagnosis_group,
    place_of_service,
    raw_rework_flag,
    header_rework_flag,
    primary_service_category,
    ingest_ts,
    source_file,
    extract_copy_count,
    has_invalid_billed_amount,
    has_missing_member_id,
    has_paid_gt_billed,
    extract_copy_count > 1 as is_duplicate_extract
from ranked
where extract_row_number = 1
