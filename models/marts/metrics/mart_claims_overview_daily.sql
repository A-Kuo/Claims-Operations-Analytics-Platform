with claims as (
    select *
    from {{ ref('fct_claims') }}
    where is_kpi_eligible
),

spine as (
    select date_day
    from {{ ref('dim_date') }}
    where date_day between date '2025-01-01' and {{ as_of_date() }}
),

submitted as (
    select
        submission_date as metric_date,
        count(*) as claims_submitted,
        count(*) filter (where ever_denied) as claims_ever_denied,
        count(*) filter (where is_rework) as claims_rework,
        count(*) filter (where is_first_pass_resolved) as claims_first_pass,
        count(*) filter (where is_open) as claims_still_open,
        sum(billed_amount) as billed_amount
    from claims
    group by 1
),

adjudicated as (
    select
        adjudication_date as metric_date,
        count(*) as claims_adjudicated,
        avg(turnaround_days) as avg_turnaround_days,
        count(*) filter (where is_adjudication_sla_breach) as sla_breaches,
        count(*) filter (where is_currently_denied) as denied_on_adjudication
    from claims
    where adjudication_date is not null
    group by 1
),

paid as (
    select
        payment_date as metric_date,
        count(*) as claims_paid,
        avg(payment_lag_days) as avg_payment_lag_days,
        sum(paid_amount) as paid_amount
    from claims
    where payment_date is not null
    group by 1
)

select
    spine.date_day as metric_date,
    coalesce(submitted.claims_submitted, 0) as claims_submitted,
    coalesce(submitted.claims_ever_denied, 0) as claims_ever_denied,
    coalesce(submitted.claims_rework, 0) as claims_rework,
    coalesce(submitted.claims_first_pass, 0) as claims_first_pass,
    coalesce(submitted.claims_still_open, 0) as claims_still_open,
    coalesce(submitted.billed_amount, 0) as billed_amount,
    coalesce(adjudicated.claims_adjudicated, 0) as claims_adjudicated,
    adjudicated.avg_turnaround_days,
    coalesce(adjudicated.sla_breaches, 0) as sla_breaches,
    coalesce(adjudicated.denied_on_adjudication, 0) as denied_on_adjudication,
    coalesce(paid.claims_paid, 0) as claims_paid,
    paid.avg_payment_lag_days,
    coalesce(paid.paid_amount, 0) as paid_amount,
    case
        when coalesce(submitted.claims_submitted, 0) = 0 then null
        else submitted.claims_ever_denied / submitted.claims_submitted
    end as denial_rate,
    case
        when coalesce(submitted.claims_submitted, 0) = 0 then null
        else submitted.claims_rework / submitted.claims_submitted
    end as rework_rate,
    case
        when coalesce(submitted.claims_submitted, 0) = 0 then null
        else submitted.claims_first_pass / submitted.claims_submitted
    end as first_pass_resolution_rate
from spine
left join submitted on spine.date_day = submitted.metric_date
left join adjudicated on spine.date_day = adjudicated.metric_date
left join paid on spine.date_day = paid.metric_date
