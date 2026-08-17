select
    claims.claim_id,
    claims.provider_id,
    providers.provider_group,
    claims.payer_id,
    payers.payer_name,
    claims.payer_type,
    claims.service_category,
    claims.submission_date,
    claims.adjudication_date,
    claims.turnaround_days,
    claims.is_adjudication_sla_breach,
    claims.current_status,
    claims.is_rework,
    claims.is_first_pass_resolved
from {{ ref('fct_claims') }} as claims
inner join {{ ref('dim_provider') }} as providers
    on claims.provider_id = providers.provider_id
inner join {{ ref('dim_payer') }} as payers
    on claims.payer_id = payers.payer_id
where claims.is_adjudicated
  and claims.is_kpi_eligible
  and claims.turnaround_days is not null
