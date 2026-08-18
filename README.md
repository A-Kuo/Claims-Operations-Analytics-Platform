# Claims Operations Analytics Platform

An end-to-end analytics project that models the claims lifecycle from submission through adjudication and payment, turning raw operational events into validated KPI dashboards for backlog, denial, turnaround-time, and provider-performance analysis.

This project is a business-facing data product: raw claims and adjudication data are cleaned, standardized, tested, and transformed into warehouse-style marts that support operations teams and analysts.

**The data is synthetic.** Identifiers, providers, payers, and amounts do not represent real patients or organizations. The value of the project is the modeling, data-quality work, KPI definitions, and operational interpretation.

All processing runs on a local DuckDB file. Nothing is sent to a cloud warehouse unless you choose to push the repo yourself.

## Who uses this

Northstar Health Plan operations leadership, claims examiners, provider relations, and analytics engineers.

The platform supports five decisions:

1. Where open inventory is aging past the 14-day adjudication SLA.
2. Which denial reasons are worth a coding or authorization intervention.
3. Which provider groups produce avoidable rework.
4. Which payer contracts drag payment lag past the 7-day target.
5. Which service categories (radiology, behavioral health, surgery) need queue redesign.

## Top KPIs

| KPI | Result in this build | Definition |
| --- | --- | --- |
| Claim volume | 41,915 eligible claims | Deduplicated headers after staging |
| Open backlog | 1,682 claims | No terminal adjudication event yet |
| Average turnaround | 11.8 days | Submission date to last adjudication date |
| Denial rate | 25.0% | Claims with at least one denial event |
| Rework rate | 24.5% | Pended, resubmitted, or header rework flag |
| First-pass resolution | 59.3% | Approved or paid with no rework |
| SLA breach rate | 24.4% | Open >14 days, or adjudicated after 14 days |
| Payment lag | 12.5 days | Adjudication to first payment |
| Paid-to-billed (paid claims) | 63.2% | Paid amount / billed amount |

Full logic lives in [docs/metric_dictionary.md](docs/metric_dictionary.md).

## Business pain point

Northstar set a **14-day first-pass adjudication SLA** and a **7-day payment SLA** after approval. Examiners still work from status lists in the claims system. Those lists mix aliases (`APPR`, `adj-denied`, `pending info`), duplicate extract reloads, and header dates that disagree with the event log. The result: backlog hides in "in review," authorization denials recycle through Summit Orthopedics and Lakeside Imaging, and Heartland Medicaid payment lag sits at 23 days against a 7-day target.

## Architecture

```text
CSV extracts (synthetic)          DuckDB warehouse (local)
data/raw/*.csv                    target/claims_ops.duckdb
        |                                  ^
        v                                  |
scripts/generate_raw_data.py               |
scripts/load_raw.py  ----------------------+
                                           |
dbt Core                                   |
  seeds (status / event crosswalks)        |
  staging  ->  intermediate  ->  marts     |
                                           |
Streamlit dashboard  <---- marts.fct_* / mart_*
dashboards/app.py
```

```mermaid
flowchart LR
    raw["Raw extracts\nheaders, lines, events"] --> stg["Staging\ncast, trim, dedupe, map status"]
    stg --> timeline["int_claim_event_timeline"]
    timeline --> state["int_claim_current_state"]
    stg --> life["int_claim_lifecycle\nTAT, SLA, rework, recovery"]
    state --> life
    timeline --> life
    life --> facts["Facts\nfct_claims, events, denials, payments"]
    facts --> kpis["KPI marts\nbacklog, denials, provider quality"]
    kpis --> dash["Streamlit ops dashboard"]
```

Current status comes from the **latest canonical event**, not the messy header status field. Header dates are fallbacks only.

## Project layout

```text
├── README.md
├── data/raw/                 # generated CSVs, gitignored
├── seeds/                    # status and event-type crosswalks
├── models/staging/
├── models/intermediate/
├── models/marts/core/        # dims and facts
├── models/marts/metrics/     # dashboard-ready marts
├── dashboards/app.py
├── analyses/                 # ops memo and analyst SQL
├── tests/
├── macros/
├── metrics/                  # dbt test/unit test summary (generated, committed)
├── docs/
├── screenshots/
└── scripts/
```

## Local setup

Python 3.12. Work stays on disk in `target/claims_ops.duckdb`.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:DBT_PROFILES_DIR = (Get-Location).Path
.\.venv\Scripts\python.exe scripts\run_pipeline.py
.\.venv\Scripts\python.exe -m streamlit run dashboards/app.py
```

`run_pipeline.py` generates extracts, loads the `raw` schema, then runs `dbt deps`, `dbt seed`, `dbt run`, and `dbt test`.

`dbt test` results are summarized into `metrics/data_profile.json` automatically at the end of `run_pipeline.py` (via `scripts/build_data_profile.py`).

To regenerate screenshots after a pipeline run:

```powershell
.\.venv\Scripts\python.exe scripts\capture_screenshots.py
```

This repo does not push anywhere. `profiles.yml` points at a local DuckDB file with no credentials.

## What the event model does

A claim is a timeline, not a single status column.

1. `stg_claim_events` maps aliases (`DENY`, `RESUB`, `check_issued`) through `event_type_crosswalk`.
2. Exact duplicate intake rows (same claim, event type, timestamp) are flagged.
3. `int_claim_event_timeline` records first submitted, first denied, first approved, first paid, last adjudication.
4. `int_claim_current_state` sets `current_status` from the latest event.
5. `int_claim_lifecycle` computes turnaround, payment lag, SLA flags, rework, first-pass resolution, and denial recovery.

That lifecycle table is the source of truth for every KPI.

## Dimensional model

**Dimensions:** `dim_member`, `dim_provider`, `dim_payer`, `dim_service`, `dim_denial_reason`, `dim_date`

**Facts:** `fct_claims`, `fct_claim_lines`, `fct_claim_events`, `fct_payments`, `fct_denials`

**KPI marts:** `mart_claims_overview_daily`, `mart_claim_backlog`, `mart_claim_backlog_by_provider`, `mart_denials_by_reason`, `mart_denial_patterns`, `mart_payment_lag_by_service`, `mart_claim_turnaround`, `mart_payment_variance`, `mart_provider_claim_quality`, `mart_provider_performance`, `mart_data_quality_exceptions`

## Data quality planted in the extract

Staging keeps the defects visible instead of silently dropping them.

| Defect | Count in this build | Handling |
| --- | --- | --- |
| Duplicate claim headers | 105 | Keep latest `ingest_ts` |
| Invalid billed amount | 85 | Flag; exclude from KPI-eligible set |
| Paid exceeds billed | 143 | Flag; retain on the fact for audit |
| Missing member_id | 43 | Map to `MBR-UNKNOWN` |
| Missing provider specialty | 18 | Label `Unknown` on `dim_provider` |

`dbt test` in this build: **83 passed** (81 data tests, 2 unit tests on current-status mapping) — full per-test breakdown in [metrics/data_profile.json](metrics/data_profile.json), generated by `scripts/build_data_profile.py` from dbt's own `run_results.json`/`manifest.json`.

## Dashboard

Four pages, filters for submission date, payer type, provider group, and service category.

1. **Operations overview.** Volume, open backlog, TAT, denial rate, payment lag, SLA breach, weekly trend, aging inventory.
2. **Denials and rework.** Reason trends, rework heatmap, highest-denial provider groups.
3. **Provider and service.** Risk buckets, denial by category, billed vs allowed vs paid, outlier providers.
4. **Claim journey.** Status funnel, event volume, failure paths, TAT distribution vs the 14-day SLA.

![Operations overview](screenshots/01_operations_overview.png)
![Denials and rework](screenshots/02_denials_and_rework.png)
![Provider and service](screenshots/03_provider_service_performance.png)
![Claim journey](screenshots/04_claim_journey.png)

Walkthrough: [docs/dashboard_walkthrough.md](docs/dashboard_walkthrough.md).

## Findings in this build

The short operations memo is [analyses/operations_memo.md](analyses/operations_memo.md). The headline:

- **Lakeside Imaging** and **Summit Orthopedics** deny about **40%** of claims (authorization and missing-modifier). Greenfield Primary Care, the clean benchmark, denies **17%**.
- **Behavioral health** averages **28.2 days** TAT against a 14-day SLA. Harbor Behavioral Health holds the largest beyond-SLA open queue (38 claims).
- **Heartland Medicaid** pays in **23 days** after adjudication. Unity Health Plan pays in **7 days**.
- Top denial reasons are **CO-4 missing modifier**, **CO-16 lacks information**, and **CO-197 authorization absent**. Those are recoverable technical denials, not medical-necessity walls.

## Documentation

- [Metric dictionary](docs/metric_dictionary.md)
- [Data dictionary](docs/data_dictionary.md)
- [Dashboard walkthrough](docs/dashboard_walkthrough.md)
- [Limitations](docs/limitations.md)
- [dbt test summary](metrics/data_profile.json)

## Resume framing

**Data analyst:** Built a claims analytics platform that turned raw operational claim events into validated KPI dashboards tracking turnaround time, denial patterns, and provider-level bottlenecks.

**Analytics engineer:** Designed dbt models and analytics marts for claims lifecycle, denial, and payment workflows, with tested KPI definitions for backlog, SLA breaches, and first-pass resolution.

**Data engineer:** Built an end-to-end claims data pipeline from raw claim-event ingestion through validated transformation layers and dashboard-ready marts, with schema testing and workflow documentation.

## License

Use this repo as a portfolio project. Do not present the dataset as real claims.
