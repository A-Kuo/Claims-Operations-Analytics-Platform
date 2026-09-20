-- Spine spans one year before the earliest service date through the end of the
-- year after the as-of date, so it follows whatever window the extracts cover.
with bounds as (
    select
        cast(date_trunc('year', min(service_date)) - interval 1 year as date) as start_day,
        cast(date_trunc('year', {{ as_of_date() }}) + interval 2 year - interval 1 day as date) as end_day
    from {{ ref('stg_claim_headers') }}
),

dates as (
    select cast(date_series.range as date) as date_day
    from bounds, range(bounds.start_day, bounds.end_day + 1, interval 1 day) as date_series
)

select
    date_day,
    year(date_day) as year_number,
    month(date_day) as month_number,
    monthname(date_day) as month_name,
    quarter(date_day) as quarter_number,
    day(date_day) as day_of_month,
    dayofweek(date_day) as day_of_week_number,
    dayname(date_day) as day_name,
    date_trunc('week', date_day)::date as week_start_date,
    date_trunc('month', date_day)::date as month_start_date,
    dayofweek(date_day) in (0, 6) as is_weekend,
    date_day = {{ as_of_date() }} as is_as_of_date
from dates
