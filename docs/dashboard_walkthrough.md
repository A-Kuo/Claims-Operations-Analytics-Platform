# Dashboard walkthrough

Open with `python -m streamlit run dashboards/app.py` after `scripts/run_pipeline.py`. The app reads `target/claims_ops.duckdb` in read-only mode.

Sidebar filters apply to submission date, payer type, provider group, and service category. All four pages use the same filtered `fct_claims` set so KPI cards do not disagree with charts.

## 1. Operations overview

Start here in a five-minute demo.

1. Read the six cards: volume, open backlog, average TAT, denial rate, payment lag, SLA breach rate.
2. The weekly chart is a **cohort** view: claims submitted that week, how many of those were ever denied, and how many of those are still open as of 2026-08-17. The open line rises at the right edge because recent submissions have not been adjudicated yet.
3. Open inventory by age is the live queue, not the cohort chart. 15-30 and 31+ days are SLA misses sitting with examiners.
4. The extract-defect table is the data-quality story: duplicates, negative billed amounts, paid-over-billed, missing member IDs, missing specialties.

## 2. Denials and rework

1. Filter a reason if you want a single CARC code.
2. Top reason lines are CO-4 (modifier), CO-16 (information), and CO-197 (authorization). Those are recoverable.
3. The heatmap is rework rate by provider group and service category. Dark cells are where examiner time is burning.
4. The table ranks provider groups by denial rate. Lakeside Imaging and Summit Orthopedics belong in the first conversation with provider relations.

## 3. Provider and service

1. High / watch / in_control counts come from `mart_provider_claim_quality`.
2. Radiology is the highest-denial service category (~35%). Behavioral health is not the denial problem; it is the TAT problem (see journey page).
3. Billed vs allowed vs paid shows leakage and contract yield together.
4. The outlier table is individual providers, not groups. Use it when a medical director asks for names.

## 4. Claim journey

1. Status funnel is current state, not historical path counts.
2. Path table splits first-pass approval, denied, denied-then-recovered, and still open.
3. TAT histogram marks the 14-day SLA. Mass to the right of the line is the breach population.

## Demo script (under five minutes)

1. Overview cards and the aging backlog chart.
2. Denials page: CO-197 and Summit Orthopedics.
3. Provider page: Greenfield vs Lakeside Imaging.
4. Journey: behavioral health TAT tail and Heartland Medicaid payment lag (filter payer type).
