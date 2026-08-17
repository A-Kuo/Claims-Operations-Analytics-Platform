select
    claims.provider_id,
    providers.provider_name,
    providers.provider_group,
    claims.service_category,
    claims.payer_type,
    count(*) as claim_count,
    sum(claims.billed_amount) as billed_amount,
    sum(claims.allowed_amount) as allowed_amount,
    sum(claims.paid_amount) as paid_amount,
    avg(claims.paid_to_billed_ratio) as avg_paid_to_billed_ratio,
    avg(claims.allowed_amount / nullif(claims.billed_amount, 0)) as avg_allowed_to_billed_ratio,
    sum(claims.billed_amount) - sum(claims.paid_amount) as unpaid_billed_gap
from {{ ref('fct_claims') }} as claims
inner join {{ ref('dim_provider') }} as providers
    on claims.provider_id = providers.provider_id
where claims.is_kpi_eligible
group by 1, 2, 3, 4, 5
