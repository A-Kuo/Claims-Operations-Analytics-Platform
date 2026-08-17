select
    claim_id,
    current_status,
    is_open,
    payment_date
from {{ ref('fct_claims') }}
where is_open
  and payment_date is not null
