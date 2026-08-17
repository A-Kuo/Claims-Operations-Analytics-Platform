with providers as (
    select * from {{ ref('stg_providers') }}
)

select
    provider_id,
    npi,
    provider_name,
    provider_group,
    coalesce(specialty, 'Unknown') as specialty,
    city,
    state,
    region,
    tin,
    is_in_network,
    has_missing_specialty
from providers
