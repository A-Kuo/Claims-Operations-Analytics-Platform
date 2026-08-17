with headers as (
    select * from {{ ref('stg_claim_headers') }}
),

timeline as (
    select * from {{ ref('int_claim_event_timeline') }}
),

state as (
    select * from {{ ref('int_claim_current_state') }}
),

joined as (
    select
        headers.claim_id,
        headers.member_id,
        headers.provider_id,
        headers.payer_id,
        headers.payer_type,
        headers.diagnosis_group,
        headers.place_of_service,
        headers.primary_service_category,
        headers.service_date,
        coalesce(cast(timeline.submitted_at as date), headers.submission_date) as submission_date,
        headers.billed_amount,
        headers.allowed_amount,
        headers.paid_amount as header_paid_amount,
        headers.has_invalid_billed_amount,
        headers.has_missing_member_id,
        headers.has_paid_gt_billed,
        headers.is_duplicate_extract,
        headers.header_rework_flag,
        state.current_status,
        state.is_open,
        state.is_approved_or_paid,
        state.is_currently_denied,
        state.is_adjudicated,
        timeline.submitted_at,
        timeline.received_at,
        timeline.first_pended_at,
        timeline.first_denied_at,
        timeline.first_approved_at,
        timeline.first_resubmitted_at,
        timeline.voided_at,
        timeline.first_paid_at,
        timeline.last_adjudicated_at,
        timeline.last_adjudication_result,
        timeline.last_event_at,
        timeline.last_event_type,
        timeline.event_count,
        timeline.rework_event_count,
        timeline.denial_event_count,
        timeline.resubmission_count,
        timeline.approval_event_count
    from headers
    left join timeline on headers.claim_id = timeline.claim_id
    left join state on headers.claim_id = state.claim_id
)

select
    claim_id,
    member_id,
    provider_id,
    payer_id,
    payer_type,
    diagnosis_group,
    place_of_service,
    primary_service_category,
    service_date,
    submission_date,
    billed_amount,
    allowed_amount,
    header_paid_amount,
    current_status,
    is_open,
    is_adjudicated,
    is_currently_denied,
    is_approved_or_paid,
    submitted_at,
    received_at,
    first_pended_at,
    first_denied_at,
    first_approved_at,
    first_resubmitted_at,
    voided_at,
    first_paid_at,
    last_adjudicated_at,
    last_adjudication_result,
    last_event_at,
    last_event_type,
    event_count,
    rework_event_count,
    denial_event_count,
    resubmission_count,
    approval_event_count,
    date_diff('day', submission_date, cast(last_adjudicated_at as date)) as turnaround_days,
    date_diff('day', cast(last_adjudicated_at as date), cast(first_paid_at as date)) as payment_lag_days,
    date_diff('day', submission_date, {{ as_of_date() }}) as days_in_inventory,
    case
        when is_open then date_diff('day', submission_date, {{ as_of_date() }}) > {{ var('adjudication_sla_days') }}
        when last_adjudicated_at is not null then date_diff('day', submission_date, cast(last_adjudicated_at as date)) > {{ var('adjudication_sla_days') }}
        else false
    end as is_adjudication_sla_breach,
    is_approved_or_paid
        and first_paid_at is null
        and last_adjudicated_at is not null
        and date_diff('day', cast(last_adjudicated_at as date), {{ as_of_date() }}) > {{ var('payment_sla_days') }} as is_payment_sla_breach,
    first_paid_at is not null
        and date_diff('day', cast(last_adjudicated_at as date), cast(first_paid_at as date)) > {{ var('payment_sla_days') }} as is_paid_late,
    denial_event_count > 0 as ever_denied,
    first_denied_at is not null and approval_event_count > 0 as is_denial_recovered,
    coalesce(header_rework_flag, false)
        or coalesce(rework_event_count, 0) > 0
        or coalesce(resubmission_count, 0) > 0 as is_rework,
    is_approved_or_paid
        and not (
            coalesce(header_rework_flag, false)
            or coalesce(rework_event_count, 0) > 0
            or coalesce(resubmission_count, 0) > 0
        ) as is_first_pass_resolved,
    current_status = 'paid' as is_paid,
    has_invalid_billed_amount,
    has_missing_member_id,
    has_paid_gt_billed,
    is_duplicate_extract,
    not has_invalid_billed_amount as is_kpi_eligible
from joined
