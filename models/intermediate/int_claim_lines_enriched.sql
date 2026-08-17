with lines as (
    select * from {{ ref('stg_claim_lines') }}
),

claims as (
    select
        claim_id,
        provider_id,
        payer_id,
        current_status,
        is_open,
        is_rework,
        ever_denied,
        is_kpi_eligible
    from {{ ref('int_claim_lifecycle') }}
)

select
    lines.line_id,
    lines.claim_id,
    lines.line_number,
    lines.service_code,
    lines.service_description,
    lines.service_category,
    lines.diagnosis_code,
    lines.billed_amount,
    lines.allowed_amount,
    lines.paid_amount,
    lines.units,
    lines.modifier,
    lines.service_date,
    claims.provider_id,
    claims.payer_id,
    claims.current_status,
    claims.is_open,
    claims.is_rework,
    claims.ever_denied,
    claims.is_kpi_eligible,
    case
        when lines.billed_amount is null or lines.billed_amount = 0 then null
        else lines.paid_amount / lines.billed_amount
    end as paid_to_billed_ratio
from lines
inner join claims on lines.claim_id = claims.claim_id
