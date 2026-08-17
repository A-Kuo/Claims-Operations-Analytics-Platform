select
    denial_reason_code,
    denial_description,
    denial_category,
    is_technical,
    is_recoverable
from {{ ref('stg_denial_codes') }}

union all

select
    'UNKNOWN' as denial_reason_code,
    'Unmapped denial reason' as denial_description,
    'Unknown' as denial_category,
    false as is_technical,
    false as is_recoverable
