select
    payer_id,
    payer_name,
    payer_type
from {{ ref('stg_payers') }}
