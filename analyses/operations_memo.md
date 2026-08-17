# Operations memo: where claims work is stalling

Northstar Health Plan · as of 17 Aug 2026 · synthetic extract

Claims operations asked why the 14-day adjudication SLA and 7-day payment SLA keep missing. The warehouse now answers with event-derived status, not the aliases in the claims-system extract.

## Headline numbers

41,915 KPI-eligible claims. 1,682 still open. Average turnaround 11.8 days, which looks acceptable until you split it. 24.4% of claims breach the 14-day clock. Denial rate 25.0%. Rework rate 24.5%. First-pass resolution 59.3%. Paid claims yield 63.2 cents on the billed dollar.

The average hides three concentrated problems: two provider groups generating avoidable denials, one specialty with a TAT twice the SLA, and one payer paying three weeks late.

## 1. Authorization and coding denials are the rework factory

Lakeside Imaging denies 40.0% of 2,132 claims. Summit Orthopedics denies 39.7% of 2,785. Greenfield Primary Care, same book of business, denies 17.0% of 4,101.

The top denial reasons are recoverable:

| Code | Reason | Events |
| --- | --- | --- |
| CO-4 | Missing modifier | 1,431 |
| CO-16 | Claim lacks information | 1,412 |
| CO-197 | Precertification/authorization absent | 1,392 |
| CO-204 | Service not authorized | 1,216 |

Radiology is the highest-denial service category at 35.4%. Surgery is next at 28.8%. These are not medical-necessity walls. They are intake failures: missing auth, missing modifier, incomplete documentation.

**Action:** stand up a pre-submission checklist with Lakeside Imaging and Summit Orthopedics for high-dollar radiology and orthopedic surgery. Track CO-197 and CO-4 weekly. Success is those two groups moving toward Greenfield's 17% denial rate, which would cut hundreds of examiner touches a month.

## 2. Behavioral health inventory ages in queue

Harbor Behavioral Health holds 116 open claims, 38 already past SLA, the worst beyond-SLA concentration in the book. Behavioral health turnaround averages 28.2 days. Emergency is 14.5 days. Evaluation and management is 10.7.

The specialty is not a denial outlier (22.6%). Examiners finish the work; they finish it late. Open claims at Harbor sit 10.6 days on average, vs 3.3 days at Greenfield.

**Action:** pull a dedicated behavioral health work queue with a 10-day internal target. If volume needs a vendor or licensed-clinician review bottleneck, that is a staffing question, not a provider-education question.

## 3. Medicaid payment lag is a contract operations issue

Heartland Medicaid pays 23.0 days after adjudication. Blue Ridge PPO 16.1 days. Northstar Commercial 8.0. Unity Health Plan 7.0, which is the SLA.

Payment lag is not an examiner problem. Approved claims wait on payer disbursement. Heartland also denies at 29.8%, the highest payer rate, so the same contract produces more rework and slower cash.

**Action:** send Heartland the payment-lag distribution and the 7-day SLA miss count. Ask for a disbursement calendar and a denial root-cause on CO-197/CO-16 mix. Do not add examiner OT against a 23-day check cycle.

## 4. What not to do

Do not staff the whole shop against the 24.4% SLA number. Most of that rate is the behavioral health tail plus recent open claims that have not had 14 days yet. Age the open queue; do not treat brand-new submissions as breaches.

Do not chase timely-filing (CO-29, 421 events) as the main lever. It is real and mostly unrecoverable, but it is a fifth the volume of modifier and auth denials.

Do not average paid-to-billed across denied claims and brief finance on 47%. Use 63.2% on paid claims, then show the unpaid billed gap by service category from `mart_payment_variance`.

## Suggested 30-day plan

1. Provider relations: Lakeside Imaging + Summit Orthopedics, CO-4 and CO-197.
2. Operations: Harbor Behavioral Health queue, daily aging past 10 days.
3. Payer: Heartland Medicaid payment-lag file.
4. Analytics: keep the dashboard filter set to those three slices in the stand-up so the numbers stay attached to owners.
