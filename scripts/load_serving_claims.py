"""Load the claim search projection from DuckDB into Postgres (serving.claims_search).

Reads marts.fct_claims joined to marts.dim_provider and streams rows into Postgres
with COPY. Risk tier matches the frontend claim register: critical if the claim
breached the adjudication SLA, elevated if it was ever denied, otherwise low.

  SUPABASE_DB_URL=postgresql://... python scripts/load_serving_claims.py
  python scripts/load_serving_claims.py --dry-run     # export check, no database needed
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

import duckdb

ROOT = Path(__file__).resolve().parents[1]

QUERY = """
select
    c.claim_id,
    c.submission_date,
    c.service_category,
    p.provider_group,
    p.provider_name,
    c.payer_type,
    c.current_status as status,
    c.turnaround_days,
    c.billed_amount,
    c.paid_amount,
    case
        when c.is_adjudication_sla_breach then 'critical'
        when c.ever_denied then 'elevated'
        else 'low'
    end as risk
from marts.fct_claims c
join marts.dim_provider p on c.provider_id = p.provider_id
where c.is_kpi_eligible
order by c.claim_id
"""

COLUMNS = (
    "claim_id, submission_date, service_category, provider_group, provider_name, "
    "payer_type, status, turnaround_days, billed_amount, paid_amount, risk"
)
BATCH_SIZE = 5000


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--duckdb-path", default=str(ROOT / "target" / "claims_ops.duckdb"))
    parser.add_argument("--dry-run", action="store_true", help="Run the export query and print a summary only")
    args = parser.parse_args()

    con = duckdb.connect(args.duckdb_path, read_only=True)
    cursor = con.execute(QUERY)

    if args.dry_run:
        total = con.execute(f"select count(*) from ({QUERY})").fetchone()[0]
        print(f"dry run: {total:,} rows would be loaded")
        for row in con.execute(f"select * from ({QUERY}) limit 3").fetchall():
            print("  ", row)
        return

    import psycopg

    url = os.environ.get("SUPABASE_DB_URL")
    if not url:
        raise SystemExit("SUPABASE_DB_URL is not set")

    loaded = 0
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute("truncate table serving.claims_search")
            with cur.copy(f"copy serving.claims_search ({COLUMNS}) from stdin") as copy:
                while True:
                    batch = cursor.fetchmany(BATCH_SIZE)
                    if not batch:
                        break
                    for row in batch:
                        copy.write_row(row)
                    loaded += len(batch)
            cur.execute("select count(*) from serving.claims_search")
            in_db = cur.fetchone()[0]
        conn.commit()

    if in_db != loaded:
        raise SystemExit(f"row count mismatch: streamed {loaded:,}, table has {in_db:,}")
    print(f"loaded {in_db:,} rows into serving.claims_search")


if __name__ == "__main__":
    main()
