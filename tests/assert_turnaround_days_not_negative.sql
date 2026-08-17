select
    claim_id,
    turnaround_days
from {{ ref('fct_claims') }}
where turnaround_days is not null
  and turnaround_days < 0
