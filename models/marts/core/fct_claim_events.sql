select
    event_id,
    claim_id,
    event_type,
    event_sequence,
    event_ts,
    event_date,
    denial_reason_code,
    actor_type,
    notes,
    is_adjudication_event,
    is_payment_event,
    is_rework_event,
    is_duplicate_event
from {{ ref('stg_claim_events') }}
where not is_duplicate_event
