with members as (
    select * from {{ ref('stg_members') }}
),

unknown as (
    select
        '{{ var("unknown_member_id") }}' as member_id,
        'Unknown' as member_age_band,
        'U' as gender,
        'Unknown' as plan_type,
        'Unknown' as region,
        cast(null as date) as enrollment_date,
        'Unknown' as product_line,
        true as is_unknown_member
)

select
    member_id,
    member_age_band,
    gender,
    plan_type,
    region,
    enrollment_date,
    product_line,
    false as is_unknown_member
from members

union all

select * from unknown
