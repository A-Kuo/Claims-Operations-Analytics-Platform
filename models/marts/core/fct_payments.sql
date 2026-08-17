select
    payment_event_id,
    claim_id,
    provider_id,
    payer_id,
    primary_service_category as service_category,
    paid_at,
    paid_date,
    paid_amount,
    billed_amount,
    allowed_amount,
    payment_lag_days,
    notes
from {{ ref('int_payment_events') }}
