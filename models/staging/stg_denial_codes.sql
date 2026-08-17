with source as (
    select * from {{ source('raw', 'raw_denial_codes') }}
)

select
    trim(denial_reason_code) as denial_reason_code,
    trim(denial_description) as denial_description,
    trim(denial_category) as denial_category,
    lower(trim(cast(is_technical as varchar))) in ('true', 't', '1', 'yes') as is_technical,
    lower(trim(cast(is_recoverable as varchar))) in ('true', 't', '1', 'yes') as is_recoverable
from source
