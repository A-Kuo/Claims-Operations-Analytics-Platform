# Metric dictionary

As-of date for this build: **2026-08-17**. Adjudication SLA: **14 calendar days** from submission. Payment SLA: **7 calendar days** from last adjudication to first payment. KPI-eligible claims exclude rows with invalid (negative or null) billed amounts.

Source of truth: `int_claim_lifecycle` / `marts.fct_claims`. Current status comes from the latest canonical event, not `raw_claim_headers.claim_status`.

## Turnaround time

Days from submission date to last adjudication event (`claim_approved`, `claim_denied`, or `claim_voided`). Null while the claim is still open.

```sql
date_diff('day', submission_date, cast(last_adjudicated_at as date)) as turnaround_days
```

This build: **11.8 days** average among adjudicated claims.

## Payment lag

Days from last adjudication to first `payment_issued` event. Null until paid.

```sql
date_diff('day', cast(last_adjudicated_at as date), cast(first_paid_at as date)) as payment_lag_days
```

This build: **12.5 days** average. Unity Health Plan 7.0 days. Heartland Medicaid 23.0 days.

## Backlog

Count of claims whose latest event is still in the open family: submitted, received, pended, additional information requested, or resubmitted. Approved-but-unpaid claims are a payment-queue problem, not adjudication backlog.

Open claims with `days_in_inventory > 14` are **beyond SLA**.

This build: **1,682** open claims.

## Denial rate

Claims with at least one `claim_denied` event divided by KPI-eligible submitted claims. A recovered denial still counts in the numerator. That is intentional: operations cares that the denial happened.

```sql
avg(cast(ever_denied as integer))
```

This build: **25.0%**.

## Rework rate

Claims with a pended event, an additional-info request, a resubmission, or a true header rework flag, divided by KPI-eligible claims.

This build: **24.5%**.

## First-pass resolution rate

Claims that reached approved or paid without rework, divided by KPI-eligible claims. Open, denied, and voided claims are in the denominator and not in the numerator.

This build: **59.3%**.

## SLA breach rate

- Open claim: `days_in_inventory > 14`
- Adjudicated claim: `turnaround_days > 14`

This build: **24.4%**.

## Paid-to-billed ratio

`paid_amount / billed_amount`. Report **paid claims only** when you talk about yield. The unfiltered average includes zeros for denied and open claims and understates contract yield.

This build: **63.2%** on paid claims.

## High-risk provider bucket

Assigned on `mart_provider_claim_quality`:

| Bucket | Rule |
| --- | --- |
| high | denial rate ≥ 35% or avg TAT ≥ 20 days or rework rate ≥ 40% |
| watch | denial rate ≥ 25% or avg TAT ≥ 16 days or rework rate ≥ 28% |
| in_control | otherwise |

Lakeside Imaging and Summit Orthopedics land in **high** (denial ~40%). Greenfield Primary Care is the in-control benchmark (denial 17%).

## Denial recovery

`first_denied_at is not null and approval_event_count > 0`. The claim was denied, then later approved. Use this to size the cost of recoverable technical denials.
