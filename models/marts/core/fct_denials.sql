select
    denial_event_id,
    claim_id,
    provider_id,
    payer_id,
    primary_service_category as service_category,
    denied_at,
    denied_date,
    coalesce(denial_reason_code, 'UNKNOWN') as denial_reason_code,
    denial_sequence,
    is_first_denial,
    is_denial_recovered,
    is_rework,
    current_status,
    notes
from {{ ref('int_denial_events') }}
