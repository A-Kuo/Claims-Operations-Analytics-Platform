with source as (
    select * from {{ source('raw', 'raw_providers') }}
)

select
    trim(provider_id) as provider_id,
    trim(cast(npi as varchar)) as npi,
    trim(provider_name) as provider_name,
    trim(provider_group) as provider_group,
    nullif(trim(specialty), '') as specialty,
    trim(city) as city,
    trim(state) as state,
    trim(region) as region,
    trim(tin) as tin,
    lower(trim(cast(is_in_network as varchar))) in ('true', 't', '1', 'yes') as is_in_network,
    nullif(trim(specialty), '') is null as has_missing_specialty
from source
