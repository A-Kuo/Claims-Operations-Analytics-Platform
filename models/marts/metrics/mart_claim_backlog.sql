select
    claims.claim_id,
    claims.provider_id,
    providers.provider_name,
    providers.provider_group,
    providers.specialty,
    claims.payer_id,
    payers.payer_name,
    payers.payer_type,
    claims.service_category,
    claims.submission_date,
    claims.current_status,
    claims.days_in_inventory,
    claims.is_adjudication_sla_breach,
    claims.billed_amount,
    claims.last_event_type,
    case
        when claims.days_in_inventory > {{ var('adjudication_sla_days') }} then 'beyond_sla'
        when claims.days_in_inventory > 7 then 'aging'
        else 'on_track'
    end as backlog_bucket
from {{ ref('fct_claims') }} as claims
inner join {{ ref('dim_provider') }} as providers
    on claims.provider_id = providers.provider_id
inner join {{ ref('dim_payer') }} as payers
    on claims.payer_id = payers.payer_id
where claims.is_open
  and claims.is_kpi_eligible
