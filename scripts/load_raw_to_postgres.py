from pathlib import Path
import os
import psycopg

DATA_DIR = Path("data/raw")

TABLE_FILE_MAP = {
    "raw.claim_headers": DATA_DIR / "claim_headers.csv",
    "raw.claim_lines": DATA_DIR / "claim_lines.csv",
    "raw.claim_events": DATA_DIR / "claim_events.csv",
    "raw.payments": DATA_DIR / "payments.csv",
}

TRUNCATE_SQL = """
truncate table raw.claim_lines restart identity cascade;
truncate table raw.claim_events restart identity cascade;
truncate table raw.payments restart identity cascade;
truncate table raw.claim_headers restart identity cascade;
"""

COPY_SQL = {
    "raw.claim_headers": """
        copy raw.claim_headers
        (claim_id, member_id, provider_id, payer_id, service_category, billed_amount,
         header_status_raw, submission_date, header_last_updated_at, source_file, batch_id)
        from stdin with (format csv, header true)
    """,
    "raw.claim_lines": """
        copy raw.claim_lines
        (claim_line_id, claim_id, line_number, procedure_code, revenue_code, units,
         line_billed_amount, service_date, source_file, batch_id)
        from stdin with (format csv, header true)
    """,
    "raw.claim_events": """
        copy raw.claim_events
        (claim_id, event_type_raw, event_ts, denial_reason_code, event_status_raw, source_file, batch_id)
        from stdin with (format csv, header true)
    """,
    "raw.payments": """
        copy raw.payments
        (payment_id, claim_id, payment_date, paid_amount, allowed_amount, payment_status, source_file, batch_id)
        from stdin with (format csv, header true)
    """,
}

def main():
    conn_str = os.environ["SUPABASE_DB_URL"]
    with psycopg.connect(conn_str) as conn:
        with conn.cursor() as cur:
            cur.execute(TRUNCATE_SQL)
            for table, path in TABLE_FILE_MAP.items():
                if not path.exists():
                    raise FileNotFoundError(f"Missing file: {path}")
                with path.open("r", encoding="utf-8") as f:
                    with cur.copy(COPY_SQL[table]) as copy:
                        copy.write(f.read())
        conn.commit()

if __name__ == "__main__":
    main()
