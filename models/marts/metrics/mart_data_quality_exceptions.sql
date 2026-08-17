with header_issues as (
    select
        'duplicate_claim_header' as issue_type,
        count(*) filter (where is_duplicate_extract) as issue_count
    from {{ ref('stg_claim_headers') }}
),

amount_issues as (
    select
        'invalid_billed_amount' as issue_type,
        count(*) filter (where has_invalid_billed_amount) as issue_count
    from {{ ref('stg_claim_headers') }}
),

member_issues as (
    select
        'missing_member_id' as issue_type,
        count(*) filter (where has_missing_member_id) as issue_count
    from {{ ref('stg_claim_headers') }}
),

paid_issues as (
    select
        'paid_exceeds_billed' as issue_type,
        count(*) filter (where has_paid_gt_billed) as issue_count
    from {{ ref('stg_claim_headers') }}
),

specialty_issues as (
    select
        'missing_provider_specialty' as issue_type,
        count(*) filter (where has_missing_specialty) as issue_count
    from {{ ref('stg_providers') }}
),

event_issues as (
    select
        'duplicate_claim_event' as issue_type,
        count(*) filter (where is_duplicate_event) as issue_count
    from {{ ref('stg_claim_events') }}
)

select * from header_issues
union all select * from amount_issues
union all select * from member_issues
union all select * from paid_issues
union all select * from specialty_issues
union all select * from event_issues
