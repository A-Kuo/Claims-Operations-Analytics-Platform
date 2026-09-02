"""Reshape generate_raw_data.py's flat extracts into the Postgres raw schema.

generate_raw_data.py produces one wide claim_headers CSV (used by the DuckDB
path via load_raw.py). The Supabase Postgres schema in
supabase/migrations/create_raw_tables.sql is normalized differently: a
minimal claim_headers table plus separate claim_lines, claim_events, and
payments tables, each carrying a batch_id. This script derives those four
CSVs from the existing raw_claim_headers/raw_claim_lines/raw_claim_events
extracts so scripts/load_raw_to_postgres.py has something to load.

Run scripts/generate_raw_data.py first.
"""

from __future__ import annotations

import argparse
import csv
from datetime import datetime, timezone
from pathlib import Path

HEADER_FIELDS = [
    "claim_id", "member_id", "provider_id", "payer_id", "service_category",
    "billed_amount", "header_status_raw", "submission_date",
    "header_last_updated_at", "source_file", "batch_id",
]
LINE_FIELDS = [
    "claim_line_id", "claim_id", "line_number", "procedure_code", "revenue_code",
    "units", "line_billed_amount", "service_date", "source_file", "batch_id",
]
EVENT_FIELDS = [
    "claim_id", "event_type_raw", "event_ts", "denial_reason_code",
    "event_status_raw", "source_file", "batch_id",
]
PAYMENT_FIELDS = [
    "payment_id", "claim_id", "payment_date", "paid_amount", "allowed_amount",
    "payment_status", "source_file", "batch_id",
]


def read_csv(path: Path) -> list[dict]:
    if not path.exists():
        raise FileNotFoundError(f"Missing {path}. Run scripts/generate_raw_data.py first.")
    with path.open("r", newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def latest_header_by_claim(headers: list[dict]) -> dict[str, dict]:
    """Mirrors stg_claim_headers' row_number() over (claim_id order by ingest_ts desc)."""
    latest: dict[str, dict] = {}
    for row in headers:
        claim_id = row["claim_id"].strip()
        current = latest.get(claim_id)
        if current is None or row["ingest_ts"] > current["ingest_ts"]:
            latest[claim_id] = row
    return latest


def build_claim_headers(headers: list[dict], batch_id: str) -> list[dict]:
    # Duplicate claim_id rows are kept intentionally: raw.claim_headers has a
    # surrogate header_id PK precisely so extract-reload duplicates land
    # intact and get caught by the quarantine marts downstream, not rejected
    # at load time.
    return [
        {
            "claim_id": row["claim_id"],
            "member_id": row["member_id"],
            "provider_id": row["provider_id"],
            "payer_id": row["payer_id"],
            "service_category": row["primary_service_category"],
            "billed_amount": row["billed_amount"],
            "header_status_raw": row["claim_status"],
            "submission_date": row["submission_date"],
            "header_last_updated_at": row["ingest_ts"],
            "source_file": row["source_file"],
            "batch_id": batch_id,
        }
        for row in headers
    ]


def build_claim_lines(lines: list[dict], source_file_by_claim: dict[str, str], batch_id: str) -> list[dict]:
    return [
        {
            "claim_line_id": row["line_id"],
            "claim_id": row["claim_id"],
            "line_number": row["line_number"],
            "procedure_code": row["service_code"],
            "revenue_code": "",
            "units": row["units"],
            "line_billed_amount": row["billed_amount"],
            "service_date": row["service_date"],
            "source_file": source_file_by_claim.get(row["claim_id"].strip(), ""),
            "batch_id": batch_id,
        }
        for row in lines
    ]


def build_claim_events(events: list[dict], source_file_by_claim: dict[str, str], batch_id: str) -> list[dict]:
    return [
        {
            "claim_id": row["claim_id"],
            "event_type_raw": row["event_type"],
            "event_ts": row["event_ts"],
            "denial_reason_code": row["denial_reason_code"],
            "event_status_raw": "",
            "source_file": source_file_by_claim.get(row["claim_id"].strip(), ""),
            "batch_id": batch_id,
        }
        for row in events
    ]


def build_payments(latest_headers: dict[str, dict], batch_id: str) -> list[dict]:
    rows = []
    for claim_id, row in latest_headers.items():
        payment_date = row["payment_date"]
        paid_amount = row["paid_amount"]
        if not payment_date or not paid_amount or float(paid_amount) <= 0:
            continue
        rows.append(
            {
                "payment_id": f"PAY-{claim_id}",
                "claim_id": claim_id,
                "payment_date": payment_date,
                "paid_amount": paid_amount,
                "allowed_amount": row["allowed_amount"],
                "payment_status": row["claim_status"],
                "source_file": row["source_file"],
                "batch_id": batch_id,
            }
        )
    return rows


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Reshape generate_raw_data.py output into the Postgres raw schema CSVs"
    )
    parser.add_argument("--raw-dir", default="data/raw")
    parser.add_argument("--batch-id", default=None, help="Defaults to a UTC-timestamp batch id")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    raw_dir = Path(args.raw_dir)
    batch_id = args.batch_id or f"BATCH-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}"

    headers = read_csv(raw_dir / "raw_claim_headers.csv")
    lines = read_csv(raw_dir / "raw_claim_lines.csv")
    events = read_csv(raw_dir / "raw_claim_events.csv")

    latest_headers = latest_header_by_claim(headers)
    source_file_by_claim = {claim_id: row["source_file"] for claim_id, row in latest_headers.items()}

    payments = build_payments(latest_headers, batch_id)

    write_csv(raw_dir / "claim_headers.csv", build_claim_headers(headers, batch_id), HEADER_FIELDS)
    write_csv(raw_dir / "claim_lines.csv", build_claim_lines(lines, source_file_by_claim, batch_id), LINE_FIELDS)
    write_csv(raw_dir / "claim_events.csv", build_claim_events(events, source_file_by_claim, batch_id), EVENT_FIELDS)
    write_csv(raw_dir / "payments.csv", payments, PAYMENT_FIELDS)

    print(f"Batch: {batch_id}")
    print(f"  claim_headers: {len(headers)} rows (includes duplicate extract reloads)")
    print(f"  claim_lines:   {len(lines)} rows")
    print(f"  claim_events:  {len(events)} rows")
    print(f"  payments:      {len(payments)} rows")


if __name__ == "__main__":
    main()
