with events as (
    select *
    from {{ ref('stg_claim_events') }}
    where event_type = 'claim_denied'
      and not is_duplicate_event
),

lifecycle as (
    select
        claim_id,
        provider_id,
        payer_id,
        primary_service_category,
        submission_date,
        is_denial_recovered,
        is_rework,
        current_status
    from {{ ref('int_claim_lifecycle') }}
),

ranked as (
    select
        events.*,
        row_number() over (partition by events.claim_id order by events.event_ts) as denial_sequence
    from events
)

select
    ranked.event_id as denial_event_id,
    ranked.claim_id,
    ranked.event_ts as denied_at,
    ranked.event_date as denied_date,
    ranked.denial_reason_code,
    ranked.notes,
    ranked.denial_sequence,
    ranked.denial_sequence = 1 as is_first_denial,
    lifecycle.provider_id,
    lifecycle.payer_id,
    lifecycle.primary_service_category,
    lifecycle.submission_date,
    lifecycle.is_denial_recovered,
    lifecycle.is_rework,
    lifecycle.current_status
from ranked
inner join lifecycle on ranked.claim_id = lifecycle.claim_id
