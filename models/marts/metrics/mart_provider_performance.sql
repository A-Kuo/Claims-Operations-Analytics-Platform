select
    provider_group,
    specialty,
    count(*) as provider_count,
    sum(claim_count) as claim_count,
    sum(open_claims) as open_claims,
    sum(denied_claims) / nullif(sum(claim_count), 0) as denial_rate,
    sum(rework_claims) / nullif(sum(claim_count), 0) as rework_rate,
    sum(first_pass_claims) / nullif(sum(claim_count), 0) as first_pass_resolution_rate,
    sum(sla_breach_claims) / nullif(sum(claim_count), 0) as sla_breach_rate,
    sum(avg_turnaround_days * claim_count) / nullif(sum(claim_count), 0) as avg_turnaround_days,
    sum(billed_amount) as billed_amount,
    case
        when sum(denied_claims) / nullif(sum(claim_count), 0) >= 0.32
            or sum(rework_claims) / nullif(sum(claim_count), 0) >= 0.36
            then 'high'
        when sum(denied_claims) / nullif(sum(claim_count), 0) >= 0.24
            or sum(rework_claims) / nullif(sum(claim_count), 0) >= 0.26
            then 'watch'
        else 'in_control'
    end as risk_bucket
from {{ ref('mart_provider_claim_quality') }}
group by 1, 2
