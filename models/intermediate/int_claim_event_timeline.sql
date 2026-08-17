with events as (
    select *
    from {{ ref('stg_claim_events') }}
    where not is_duplicate_event
      and event_type <> 'unknown'
)

select
    claim_id,
    min(case when event_type = 'claim_submitted' then event_ts end) as submitted_at,
    min(case when event_type = 'claim_received' then event_ts end) as received_at,
    min(case when event_type = 'claim_pended' then event_ts end) as first_pended_at,
    min(case when event_type = 'additional_info_requested' then event_ts end) as first_info_requested_at,
    min(case when event_type = 'claim_denied' then event_ts end) as first_denied_at,
    min(case when event_type = 'claim_approved' then event_ts end) as first_approved_at,
    min(case when event_type = 'claim_resubmitted' then event_ts end) as first_resubmitted_at,
    min(case when event_type = 'claim_voided' then event_ts end) as voided_at,
    min(case when event_type = 'payment_issued' then event_ts end) as first_paid_at,
    max(case when is_adjudication_event then event_ts end) as last_adjudicated_at,
    arg_max(event_type, event_ts) filter (
        where event_type in ('claim_approved', 'claim_denied', 'claim_voided')
    ) as last_adjudication_result,
    max(event_ts) as last_event_at,
    arg_max(event_type, event_ts) as last_event_type,
    count(*) as event_count,
    count(*) filter (where is_rework_event) as rework_event_count,
    count(*) filter (where event_type = 'claim_denied') as denial_event_count,
    count(*) filter (where event_type = 'claim_resubmitted') as resubmission_count,
    count(*) filter (where event_type = 'claim_approved') as approval_event_count
from events
group by claim_id
