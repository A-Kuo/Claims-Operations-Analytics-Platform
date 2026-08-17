with source as (
    select * from {{ source('raw', 'raw_payers') }}
)

select
    trim(payer_id) as payer_id,
    trim(payer_name) as payer_name,
    trim(payer_type) as payer_type
from source
