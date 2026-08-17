select
    claims.service_category,
    claims.payer_type,
    count(*) as paid_claims,
    avg(claims.payment_lag_days) as avg_payment_lag_days,
    median(claims.payment_lag_days) as median_payment_lag_days,
    count(*) filter (where claims.is_paid_late) as paid_late_claims,
    avg(claims.paid_amount) as avg_paid_amount,
    avg(claims.billed_amount) as avg_billed_amount,
    avg(claims.paid_to_billed_ratio) as avg_paid_to_billed_ratio
from {{ ref('fct_claims') }} as claims
where claims.is_paid
  and claims.is_kpi_eligible
  and claims.payment_lag_days is not null
group by 1, 2
