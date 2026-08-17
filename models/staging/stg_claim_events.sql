with source as (
    select * from {{ source('raw', 'raw_claim_events') }}
),

typed as (
    select
        trim(event_id) as event_id,
        trim(claim_id) as claim_id,
        trim(event_type) as raw_event_type,
        try_cast(event_ts as timestamp) as event_ts,
        {{ parse_mixed_date('event_date') }} as event_date,
        nullif(trim(denial_reason_code), '') as denial_reason_code,
        nullif(trim(notes), '') as notes,
        trim(actor_type) as actor_type,
        try_cast(ingest_ts as timestamp) as ingest_ts
    from source
),

normalized as (
    select
        typed.*,
        coalesce(crosswalk.canonical_event_type, 'unknown') as event_type,
        coalesce(crosswalk.event_sequence, 999) as event_sequence,
        coalesce(try_cast(crosswalk.is_adjudication_event as boolean), false) as is_adjudication_event,
        coalesce(try_cast(crosswalk.is_payment_event as boolean), false) as is_payment_event,
        coalesce(try_cast(crosswalk.is_rework_event as boolean), false) as is_rework_event
    from typed
    left join {{ ref('event_type_crosswalk') }} as crosswalk
        on typed.raw_event_type = crosswalk.raw_event_type
),

ranked as (
    select
        *,
        row_number() over (
            partition by claim_id, event_type, event_ts
            order by event_id
        ) as duplicate_event_rank
    from normalized
    where event_id is not null
)

select
    event_id,
    claim_id,
    raw_event_type,
    event_type,
    event_sequence,
    event_ts,
    coalesce(event_date, cast(event_ts as date)) as event_date,
    denial_reason_code,
    notes,
    actor_type,
    ingest_ts,
    is_adjudication_event,
    is_payment_event,
    is_rework_event,
    duplicate_event_rank > 1 as is_duplicate_event
from ranked
