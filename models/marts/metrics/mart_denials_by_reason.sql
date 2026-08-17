select
    denials.denied_date,
    denials.denial_reason_code,
    reasons.denial_description,
    reasons.denial_category,
    reasons.is_technical,
    reasons.is_recoverable,
    denials.payer_id,
    payers.payer_name,
    payers.payer_type,
    denials.service_category,
    denials.provider_id,
    count(*) as denial_events,
    count(*) filter (where denials.is_first_denial) as first_denials,
    count(*) filter (where denials.is_denial_recovered) as recovered_denials
from {{ ref('fct_denials') }} as denials
inner join {{ ref('dim_denial_reason') }} as reasons
    on denials.denial_reason_code = reasons.denial_reason_code
inner join {{ ref('dim_payer') }} as payers
    on denials.payer_id = payers.payer_id
group by 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
