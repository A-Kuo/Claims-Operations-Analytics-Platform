select
    backlog.provider_id,
    backlog.provider_name,
    backlog.provider_group,
    backlog.specialty,
    count(*) as open_claims,
    count(*) filter (where backlog.is_adjudication_sla_breach) as sla_breach_claims,
    avg(backlog.days_in_inventory) as avg_days_in_inventory,
    max(backlog.days_in_inventory) as max_days_in_inventory,
    sum(backlog.billed_amount) as billed_amount_at_risk,
    count(*) filter (where backlog.backlog_bucket = 'beyond_sla') as beyond_sla_claims,
    count(*) filter (where backlog.backlog_bucket = 'aging') as aging_claims
from {{ ref('mart_claim_backlog') }} as backlog
group by 1, 2, 3, 4
