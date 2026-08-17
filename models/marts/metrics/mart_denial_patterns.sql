select
    date_trunc('month', denials.denied_date)::date as denial_month,
    denials.denial_reason_code,
    reasons.denial_description,
    reasons.denial_category,
    denials.service_category,
    payers.payer_type,
    count(*) as denial_events,
    count(distinct denials.claim_id) as denied_claims,
    count(*) filter (where denials.is_denial_recovered) as recovered_denial_events
from {{ ref('fct_denials') }} as denials
inner join {{ ref('dim_denial_reason') }} as reasons
    on denials.denial_reason_code = reasons.denial_reason_code
inner join {{ ref('dim_payer') }} as payers
    on denials.payer_id = payers.payer_id
group by 1, 2, 3, 4, 5, 6
