-- Analyst query: denial reasons with the largest month-over-month increase.
with monthly as (
    select
        denial_month,
        denial_reason_code,
        denial_description,
        sum(denial_events) as denial_events
    from {{ ref('mart_denial_patterns') }}
    group by 1, 2, 3
),

lagged as (
    select
        *,
        lag(denial_events) over (
            partition by denial_reason_code
            order by denial_month
        ) as prior_month_events
    from monthly
)

select
    denial_month,
    denial_reason_code,
    denial_description,
    denial_events,
    prior_month_events,
    denial_events - prior_month_events as event_change
from lagged
where prior_month_events is not null
order by event_change desc
limit 20
