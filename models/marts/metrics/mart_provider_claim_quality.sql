with claims as (
    select
        claims.*,
        providers.provider_name,
        providers.provider_group,
        providers.specialty
    from {{ ref('fct_claims') }} as claims
    inner join {{ ref('dim_provider') }} as providers
        on claims.provider_id = providers.provider_id
    where claims.is_kpi_eligible
),

grouped as (
    select
        provider_id,
        provider_name,
        provider_group,
        specialty,
        count(*) as claim_count,
        count(*) filter (where is_open) as open_claims,
        count(*) filter (where ever_denied) as denied_claims,
        count(*) filter (where is_rework) as rework_claims,
        count(*) filter (where is_first_pass_resolved) as first_pass_claims,
        count(*) filter (where is_adjudication_sla_breach) as sla_breach_claims,
        avg(turnaround_days) as avg_turnaround_days,
        avg(payment_lag_days) as avg_payment_lag_days,
        avg(paid_to_billed_ratio) as avg_paid_to_billed_ratio,
        sum(billed_amount) as billed_amount
    from claims
    group by 1, 2, 3, 4
)

select
    *,
    denied_claims / nullif(claim_count, 0) as denial_rate,
    rework_claims / nullif(claim_count, 0) as rework_rate,
    first_pass_claims / nullif(claim_count, 0) as first_pass_resolution_rate,
    sla_breach_claims / nullif(claim_count, 0) as sla_breach_rate,
    case
        when denied_claims / nullif(claim_count, 0) >= 0.35
            or avg_turnaround_days >= 20
            or rework_claims / nullif(claim_count, 0) >= 0.40
            then 'high'
        when denied_claims / nullif(claim_count, 0) >= 0.25
            or avg_turnaround_days >= 16
            or rework_claims / nullif(claim_count, 0) >= 0.28
            then 'watch'
        else 'in_control'
    end as risk_bucket
from grouped
