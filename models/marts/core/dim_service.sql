select
    service_code,
    any_value(service_description) as service_description,
    any_value(service_category) as service_category
from {{ ref('stg_claim_lines') }}
group by service_code
