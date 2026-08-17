with source as (
    select * from {{ source('raw', 'raw_claim_lines') }}
),

typed as (
    select
        trim(claim_id) as claim_id,
        trim(line_id) as line_id,
        try_cast(line_number as integer) as line_number,
        trim(service_code) as service_code,
        trim(service_description) as service_description,
        trim(service_category) as service_category,
        trim(diagnosis_code) as diagnosis_code,
        try_cast(billed_amount as decimal(18, 2)) as billed_amount,
        try_cast(allowed_amount as decimal(18, 2)) as allowed_amount,
        try_cast(paid_amount as decimal(18, 2)) as paid_amount,
        try_cast(units as integer) as units,
        nullif(trim(modifier), '') as modifier,
        {{ parse_mixed_date('service_date') }} as service_date
    from source
),

ranked as (
    select
        *,
        row_number() over (partition by line_id order by line_number) as row_num
    from typed
    where line_id is not null
)

select
    line_id,
    claim_id,
    line_number,
    service_code,
    service_description,
    service_category,
    diagnosis_code,
    billed_amount,
    allowed_amount,
    paid_amount,
    units,
    modifier,
    service_date,
    billed_amount is null or billed_amount < 0 as has_invalid_billed_amount
from ranked
where row_num = 1
