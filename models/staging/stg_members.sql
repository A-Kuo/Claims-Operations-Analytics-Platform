with source as (
    select * from {{ source('raw', 'raw_members') }}
)

select
    trim(member_id) as member_id,
    trim(member_age_band) as member_age_band,
    trim(gender) as gender,
    trim(plan_type) as plan_type,
    trim(region) as region,
    try_cast(enrollment_date as date) as enrollment_date,
    trim(product_line) as product_line
from source
