with dates as (
    select date '2024-01-01' + cast(generate_series as integer) as date_day
    from generate_series(0, 1461)
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
