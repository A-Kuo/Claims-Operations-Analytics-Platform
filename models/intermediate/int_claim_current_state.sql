with timeline as (
    select * from {{ ref('int_claim_event_timeline') }}
)

select
    claim_id,
    last_event_type,
    last_event_at,
    case last_event_type
        when 'payment_issued' then 'paid'
        when 'payment_adjusted' then 'paid'
        when 'claim_approved' then 'approved'
        when 'claim_denied' then 'denied'
        when 'claim_voided' then 'voided'
        when 'claim_pended' then 'pended'
        when 'additional_info_requested' then 'pended'
        when 'claim_resubmitted' then 'in_review'
        when 'claim_received' then 'in_review'
        when 'claim_submitted' then 'submitted'
        else 'unknown'
    end as current_status,
    last_event_type in ('claim_submitted', 'claim_received', 'claim_pended', 'additional_info_requested', 'claim_resubmitted') as is_open,
    last_event_type in ('claim_approved', 'payment_issued', 'payment_adjusted') as is_approved_or_paid,
    last_event_type = 'claim_denied' as is_currently_denied,
    last_adjudicated_at is not null as is_adjudicated
from timeline
