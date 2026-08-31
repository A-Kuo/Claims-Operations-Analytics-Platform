import os
from pathlib import Path
import pandas as pd
import psycopg

DATA_DIR = Path("data/raw")

CHECKS = {
    "raw.claim_headers": DATA_DIR / "claim_headers.csv",
    "raw.claim_lines": DATA_DIR / "claim_lines.csv",
    "raw.claim_events": DATA_DIR / "claim_events.csv",
    "raw.payments": DATA_DIR / "payments.csv",
}

def csv_row_count(path: Path) -> int:
    return len(pd.read_csv(path))

def db_row_count(cur, table: str) -> int:
    cur.execute(f"select count(*) from {table}")
    return cur.fetchone()[0]

def main():
    conn_str = os.environ["SUPABASE_DB_URL"]
    failures = []

    with psycopg.connect(conn_str) as conn:
        with conn.cursor() as cur:
            for table, path in CHECKS.items():
                src = csv_row_count(path)
                tgt = db_row_count(cur, table)
                if src != tgt:
                    failures.append((table, src, tgt))

    if failures:
        msg = "\n".join([f"{t}: csv={s}, db={d}" for t, s, d in failures])
        raise SystemExit(f"Row count mismatch detected:\n{msg}")

if __name__ == "__main__":
    main()
