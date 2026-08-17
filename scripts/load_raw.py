"""Load generated CSVs into the local DuckDB warehouse raw schema."""

from __future__ import annotations

import argparse
from pathlib import Path

import duckdb

TABLES = [
    "raw_payers",
    "raw_denial_codes",
    "raw_providers",
    "raw_members",
    "raw_claim_headers",
    "raw_claim_lines",
    "raw_claim_events",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load raw CSVs into DuckDB")
    parser.add_argument("--duckdb-path", default="target/claims_ops.duckdb")
    parser.add_argument("--raw-dir", default="data/raw")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    raw_dir = Path(args.raw_dir)
    db_path = Path(args.duckdb_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    missing = [name for name in TABLES if not (raw_dir / f"{name}.csv").exists()]
    if missing:
        raise SystemExit(
            f"Missing raw extracts {missing}. Run python scripts/generate_raw_data.py first."
        )

    con = duckdb.connect(str(db_path))
    con.execute("create schema if not exists raw")
    for name in TABLES:
        csv_path = (raw_dir / f"{name}.csv").as_posix()
        con.execute(
            f"""
            create or replace table raw.{name} as
            select * from read_csv_auto('{csv_path}', header=true, sample_size=-1, all_varchar=true)
            """
        )
        count = con.execute(f"select count(*) from raw.{name}").fetchone()[0]
        print(f"loaded raw.{name}: {count:,} rows")
    con.close()
    print(f"DuckDB warehouse: {db_path.resolve()}")


if __name__ == "__main__":
    main()
