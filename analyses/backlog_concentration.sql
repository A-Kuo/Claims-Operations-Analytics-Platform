-- Analyst query: backlog concentration by provider group and SLA bucket.
select
    provider_group,
    backlog_bucket,
    count(*) as open_claims,
    sum(billed_amount) as billed_amount_at_risk,
    avg(days_in_inventory) as avg_days_open
from {{ ref('mart_claim_backlog') }}
group by 1, 2
order by billed_amount_at_risk desc
