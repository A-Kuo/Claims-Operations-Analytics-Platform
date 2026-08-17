with events as (
    select *
    from {{ ref('stg_claim_events') }}
    where is_payment_event
      and not is_duplicate_event
),

lifecycle as (
    select
        claim_id,
        provider_id,
        payer_id,
        primary_service_category,
        last_adjudicated_at,
        header_paid_amount,
        billed_amount,
        allowed_amount
    from {{ ref('int_claim_lifecycle') }}
)

select
    events.event_id as payment_event_id,
    events.claim_id,
    events.event_type,
    events.event_ts as paid_at,
    events.event_date as paid_date,
    events.notes,
    lifecycle.provider_id,
    lifecycle.payer_id,
    lifecycle.primary_service_category,
    lifecycle.header_paid_amount as paid_amount,
    lifecycle.billed_amount,
    lifecycle.allowed_amount,
    date_diff('day', cast(lifecycle.last_adjudicated_at as date), events.event_date) as payment_lag_days
from events
inner join lifecycle on events.claim_id = lifecycle.claim_id
where events.event_type = 'payment_issued'
