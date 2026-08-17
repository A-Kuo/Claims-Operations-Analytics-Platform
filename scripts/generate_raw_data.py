"""Generate synthetic claims operational extracts for local analytics.

The output is fictional. Member, provider, and claim identifiers do not
refer to real people or organizations. The generator plants operational
patterns (auth denials, slow payers, specialty delays) and common extract
defects so staging and tests have something real to do.
"""

from __future__ import annotations

import argparse
import csv
import random
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path

SEED = 42
AS_OF = date(2026, 8, 17)
WINDOW_START = date(2025, 1, 1)

N_MEMBERS = 8000
N_CLAIMS = 42000
N_PROVIDERS = 420

STATUS_ALIASES = {
    "submitted": ["SUBMITTED", "Received", "NEW", "submitted"],
    "in_review": ["IN REVIEW", "in_review", "Processing", "UNDER REVIEW"],
    "pended": ["PEND", "Pended", "pending info", "HOLD", "Pending"],
    "approved": ["Approved", "APPROVED", "adj-approved", "approved ", "APPR"],
    "denied": ["DENIED", "Deny", "rejected", "adj-denied", "DENY"],
    "paid": ["PAID", "paid", "Payment Complete", "paid "],
    "voided": ["VOID", "Cancelled", "void"],
}

EVENT_ALIASES = {
    "claim_submitted": ["claim_submitted", "SUBMIT", "Claim Submitted"],
    "claim_received": ["claim_received", "RECEIVED", "intake_complete"],
    "claim_pended": ["claim_pended", "PEND", "pended_for_review"],
    "additional_info_requested": ["additional_info_requested", "DEV", "info_request"],
    "claim_denied": ["claim_denied", "DENY", "adjudication_denied"],
    "claim_approved": ["claim_approved", "APPROVE", "adjudication_approved"],
    "claim_resubmitted": ["claim_resubmitted", "RESUB", "provider_resubmit"],
    "payment_issued": ["payment_issued", "PAY", "check_issued"],
    "payment_adjusted": ["payment_adjusted", "ADJ", "payment_corr"],
    "claim_voided": ["claim_voided", "VOID", "cancelled"],
}

REWORK_ALIASES = {
    True: ["Y", "1", "true", "yes"],
    False: ["N", "0", "false", "no", ""],
}

PAYERS = [
    {"payer_id": "PAY-01", "payer_name": "Northstar Commercial", "payer_type": "Commercial", "pay_lag": 6, "deny_adj": 0.00},
    {"payer_id": "PAY-02", "payer_name": "Blue Ridge PPO", "payer_type": "Commercial", "pay_lag": 14, "deny_adj": 0.02},
    {"payer_id": "PAY-03", "payer_name": "Heartland Medicaid", "payer_type": "Medicaid", "pay_lag": 21, "deny_adj": 0.06},
    {"payer_id": "PAY-04", "payer_name": "Summit Medicare Advantage", "payer_type": "Medicare Advantage", "pay_lag": 9, "deny_adj": 0.04},
    {"payer_id": "PAY-05", "payer_name": "Unity Health Plan", "payer_type": "Commercial", "pay_lag": 5, "deny_adj": -0.03},
    {"payer_id": "PAY-06", "payer_name": "Employers Trust", "payer_type": "Self-funded", "pay_lag": 11, "deny_adj": 0.01},
]

DENIAL_CODES = [
    {"code": "CO-4", "desc": "Missing modifier", "category": "Coding", "technical": True, "recoverable": True},
    {"code": "CO-16", "desc": "Claim lacks information", "category": "Documentation", "technical": True, "recoverable": True},
    {"code": "CO-18", "desc": "Duplicate claim/service", "category": "Duplicate", "technical": True, "recoverable": False},
    {"code": "CO-22", "desc": "Coordination of benefits", "category": "Eligibility", "technical": False, "recoverable": True},
    {"code": "CO-29", "desc": "Timely filing limit exceeded", "category": "Timely filing", "technical": True, "recoverable": False},
    {"code": "CO-50", "desc": "Non-covered service", "category": "Medical necessity", "technical": False, "recoverable": False},
    {"code": "CO-97", "desc": "Benefit maximum reached", "category": "Benefits", "technical": False, "recoverable": False},
    {"code": "CO-109", "desc": "Out of network", "category": "Network", "technical": False, "recoverable": True},
    {"code": "CO-151", "desc": "Payment adjusted; information incomplete", "category": "Documentation", "technical": True, "recoverable": True},
    {"code": "CO-197", "desc": "Precertification/authorization absent", "category": "Authorization", "technical": True, "recoverable": True},
    {"code": "CO-204", "desc": "Service not authorized", "category": "Authorization", "technical": True, "recoverable": True},
    {"code": "N-30", "desc": "Patient ineligible on date of service", "category": "Eligibility", "technical": False, "recoverable": False},
    {"code": "CO-B7", "desc": "Provider not eligible to bill this service", "category": "Provider", "technical": False, "recoverable": True},
]

SERVICES = [
    {"code": "PRC-99213", "desc": "Office visit, established, low complexity", "category": "Evaluation & Management", "billed": 185},
    {"code": "PRC-99214", "desc": "Office visit, established, moderate complexity", "category": "Evaluation & Management", "billed": 265},
    {"code": "PRC-99285", "desc": "Emergency department visit, high severity", "category": "Emergency", "billed": 1420},
    {"code": "PRC-99291", "desc": "Critical care, first hour", "category": "Emergency", "billed": 2100},
    {"code": "PRC-70450", "desc": "CT head without contrast", "category": "Radiology", "billed": 890},
    {"code": "PRC-70553", "desc": "MRI brain with and without contrast", "category": "Radiology", "billed": 2450},
    {"code": "PRC-71046", "desc": "Chest X-ray, 2 views", "category": "Radiology", "billed": 145},
    {"code": "PRC-80053", "desc": "Comprehensive metabolic panel", "category": "Laboratory", "billed": 92},
    {"code": "PRC-85025", "desc": "Complete blood count with differential", "category": "Laboratory", "billed": 48},
    {"code": "PRC-27447", "desc": "Total knee arthroplasty", "category": "Surgery", "billed": 28500},
    {"code": "PRC-29881", "desc": "Knee arthroscopy, meniscectomy", "category": "Surgery", "billed": 6400},
    {"code": "PRC-43239", "desc": "EGD with biopsy", "category": "Surgery", "billed": 1850},
    {"code": "PRC-97110", "desc": "Therapeutic exercises, 15 minutes", "category": "Physical Therapy", "billed": 95},
    {"code": "PRC-97530", "desc": "Therapeutic activities, 15 minutes", "category": "Physical Therapy", "billed": 110},
    {"code": "PRC-90834", "desc": "Psychotherapy, 45 minutes", "category": "Behavioral Health", "billed": 165},
    {"code": "PRC-90837", "desc": "Psychotherapy, 60 minutes", "category": "Behavioral Health", "billed": 210},
    {"code": "PRC-E0601", "desc": "CPAP device", "category": "Durable Medical Equipment", "billed": 980},
    {"code": "PRC-K0001", "desc": "Standard wheelchair", "category": "Durable Medical Equipment", "billed": 650},
    {"code": "PRC-J1745", "desc": "Infliximab injection, 10 mg", "category": "Infusion", "billed": 420},
    {"code": "PRC-93000", "desc": "Electrocardiogram, complete", "category": "Cardiology", "billed": 125},
    {"code": "PRC-93306", "desc": "Echocardiography, complete", "category": "Cardiology", "billed": 780},
    {"code": "PRC-93458", "desc": "Left heart catheterization", "category": "Cardiology", "billed": 9200},
]

DIAGNOSIS_GROUPS = [
    "Diabetes",
    "Orthopedic",
    "Cardiac",
    "Respiratory",
    "Behavioral",
    "Injury",
    "Preventive",
    "Gastrointestinal",
    "Other",
]

DIAGNOSIS_CODES = {
    "Diabetes": ["E11.9", "E11.65", "E10.9"],
    "Orthopedic": ["M17.11", "M54.5", "S83.241A"],
    "Cardiac": ["I25.10", "I50.9", "I48.91"],
    "Respiratory": ["J18.9", "J44.1", "J45.40"],
    "Behavioral": ["F32.1", "F41.1", "F33.1"],
    "Injury": ["S72.001A", "S06.0X0A", "W19.XXXA"],
    "Preventive": ["Z00.00", "Z23", "Z13.6"],
    "Gastrointestinal": ["K21.0", "K57.30", "K92.2"],
    "Other": ["R07.9", "N39.0", "M79.3"],
}

REGIONS = ["North", "Central", "Coastal", "West", "Metro"]
STATES = {"North": "OH", "Central": "IN", "Coastal": "NC", "West": "TN", "Metro": "IL"}
AGE_BANDS = ["18-34", "35-44", "45-54", "55-64", "65-74", "75+"]
PLAN_TYPES = ["HMO", "PPO", "EPO", "HDHP"]
PLACE_OF_SERVICE = ["11", "21", "22", "23", "81"]

GROUP_SPECS = [
    {"group": "Summit Orthopedics", "specialty": "Orthopedic Surgery", "n": 28, "region": "North", "pattern": "auth"},
    {"group": "Lakeside Imaging", "specialty": "Radiology", "n": 22, "region": "Central", "pattern": "modifier"},
    {"group": "Harbor Behavioral Health", "specialty": "Behavioral Health", "n": 18, "region": "Coastal", "pattern": "slow"},
    {"group": "Metro Emergency Physicians", "specialty": "Emergency Medicine", "n": 36, "region": "Metro", "pattern": "volume"},
    {"group": "Greenfield Primary Care", "specialty": "Family Medicine", "n": 42, "region": "West", "pattern": "clean"},
    {"group": "Riverside Cardiology", "specialty": "Cardiology", "n": 24, "region": "North", "pattern": "none"},
    {"group": "Oak Street Lab Network", "specialty": "Pathology", "n": 16, "region": "Central", "pattern": "none"},
    {"group": "Valley Surgical Associates", "specialty": "General Surgery", "n": 20, "region": "West", "pattern": "none"},
    {"group": "Lumen Physical Therapy", "specialty": "Physical Therapy", "n": 18, "region": "Coastal", "pattern": "none"},
    {"group": "Northwind Infusion Center", "specialty": "Hematology/Oncology", "n": 12, "region": "Metro", "pattern": "none"},
    {"group": "Prairie DME Supply", "specialty": "Durable Medical Equipment", "n": 10, "region": "Central", "pattern": "none"},
    {"group": "Cedar Pediatrics", "specialty": "Pediatrics", "n": 14, "region": "West", "pattern": "none"},
]


@dataclass
class Provider:
    provider_id: str
    npi: str
    provider_name: str
    provider_group: str
    specialty: str | None
    city: str
    state: str
    region: str
    tin: str
    is_in_network: bool
    pattern: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate synthetic claims extracts")
    parser.add_argument(
        "--output-dir",
        default="data/raw",
        help="Directory for CSV extracts",
    )
    parser.add_argument("--seed", type=int, default=SEED)
    return parser.parse_args()


def daterange_days(start: date, end: date) -> int:
    return (end - start).days


def random_date(rng: random.Random, start: date, end: date) -> date:
    span = max(daterange_days(start, end), 1)
    return start + timedelta(days=rng.randrange(span))


def format_date(rng: random.Random, value: date | None) -> str:
    if value is None:
        return ""
    roll = rng.random()
    if roll < 0.90:
        return value.isoformat()
    if roll < 0.97:
        return value.strftime("%m/%d/%Y")
    return value.strftime("%Y/%m/%d")


def jitter_amount(rng: random.Random, base: float) -> float:
    return round(base * rng.uniform(0.85, 1.25), 2)


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def build_providers(rng: random.Random) -> list[Provider]:
    first = ["Avery", "Jordan", "Riley", "Quinn", "Morgan", "Cameron", "Reese", "Skyler", "Hayden", "Parker"]
    last = ["Nguyen", "Patel", "Brooks", "Okoye", "Singh", "Walsh", "Garcia", "Khan", "Diaz", "Bennett"]
    cities = {
        "North": ["Toledo", "Cleveland", "Akron"],
        "Central": ["Indianapolis", "Fort Wayne", "Bloomington"],
        "Coastal": ["Wilmington", "Raleigh", "Greenville"],
        "West": ["Nashville", "Knoxville", "Memphis"],
        "Metro": ["Chicago", "Naperville", "Evanston"],
    }
    providers: list[Provider] = []
    pid = 1
    for spec in GROUP_SPECS:
        for i in range(spec["n"]):
            specialty = spec["specialty"]
            if rng.random() < 0.08:
                specialty = None
            region = spec["region"]
            providers.append(
                Provider(
                    provider_id=f"PRV-{pid:04d}",
                    npi=str(1000000000 + pid),
                    provider_name=f"{rng.choice(first)} {rng.choice(last)} {i+1}",
                    provider_group=spec["group"],
                    specialty=specialty,
                    city=rng.choice(cities[region]),
                    state=STATES[region],
                    region=region,
                    tin=f"{rng.randint(10, 99)}-{rng.randint(1000000, 9999999)}",
                    is_in_network=rng.random() > 0.07,
                    pattern=spec["pattern"],
                )
            )
            pid += 1
    while len(providers) < N_PROVIDERS:
        region = rng.choice(REGIONS)
        providers.append(
            Provider(
                provider_id=f"PRV-{pid:04d}",
                npi=str(1000000000 + pid),
                provider_name=f"{rng.choice(first)} {rng.choice(last)} {pid}",
                provider_group=f"{region} Independent Practice {pid % 17}",
                specialty=rng.choice(["Family Medicine", "Internal Medicine", "Nurse Practitioner"]),
                city=rng.choice(["Dayton", "Peoria", "Asheville", "Chattanooga", "Joliet"]),
                state=STATES[region],
                region=region,
                tin=f"{rng.randint(10, 99)}-{rng.randint(1000000, 9999999)}",
                is_in_network=rng.random() > 0.12,
                pattern="none",
            )
        )
        pid += 1
    return providers


def build_members(rng: random.Random) -> list[dict]:
    rows = []
    for i in range(1, N_MEMBERS + 1):
        region = rng.choice(REGIONS)
        rows.append(
            {
                "member_id": f"MBR-{i:07d}",
                "member_age_band": rng.choice(AGE_BANDS),
                "gender": rng.choice(["F", "M", "U"]),
                "plan_type": rng.choice(PLAN_TYPES),
                "region": region,
                "enrollment_date": random_date(rng, date(2019, 1, 1), date(2025, 6, 1)).isoformat(),
                "product_line": rng.choice(["Fully insured", "ASO", "Medicare Advantage", "Medicaid MCO"]),
            }
        )
    return rows


def specialty_service(specialty: str | None, rng: random.Random) -> dict:
    mapping = {
        "Orthopedic Surgery": ["Surgery", "Physical Therapy", "Evaluation & Management"],
        "Radiology": ["Radiology"],
        "Behavioral Health": ["Behavioral Health"],
        "Emergency Medicine": ["Emergency", "Radiology", "Laboratory"],
        "Family Medicine": ["Evaluation & Management", "Laboratory", "Preventive"],
        "Cardiology": ["Cardiology", "Evaluation & Management"],
        "Pathology": ["Laboratory"],
        "General Surgery": ["Surgery"],
        "Physical Therapy": ["Physical Therapy"],
        "Hematology/Oncology": ["Infusion", "Evaluation & Management"],
        "Durable Medical Equipment": ["Durable Medical Equipment"],
        "Pediatrics": ["Evaluation & Management", "Laboratory"],
        "Internal Medicine": ["Evaluation & Management", "Laboratory", "Cardiology"],
        "Nurse Practitioner": ["Evaluation & Management"],
    }
    preferred = mapping.get(specialty or "", ["Evaluation & Management"])
    category = rng.choice(preferred)
    candidates = [s for s in SERVICES if s["category"] == category] or SERVICES
    return rng.choice(candidates)


def month_weight(service_date: date) -> float:
    # January deductible rush, December holiday dip, otherwise slight growth.
    growth = 1.0 + (service_date.year - 2025) * 0.08 + service_date.month * 0.004
    if service_date.month == 1:
        return growth * 1.22
    if service_date.month == 12:
        return growth * 0.86
    return growth


def pick_service_date(rng: random.Random) -> date:
    for _ in range(20):
        candidate = random_date(rng, WINDOW_START, AS_OF)
        if rng.random() < min(month_weight(candidate) / 1.4, 0.95):
            return candidate
    return random_date(rng, WINDOW_START, AS_OF)


def pick_denial_code(rng: random.Random, pattern: str, service_category: str, late_file: bool) -> str:
    if late_file:
        return "CO-29"
    if pattern == "auth" and rng.random() < 0.65:
        return rng.choice(["CO-197", "CO-204"])
    if pattern == "modifier" or (service_category == "Radiology" and rng.random() < 0.35):
        return rng.choice(["CO-4", "CO-16"])
    if service_category == "Radiology" and rng.random() < 0.25:
        return "CO-197"
    return rng.choice([c["code"] for c in DENIAL_CODES if c["code"] not in {"CO-29"}])


def canonical_or_alias(rng: random.Random, mapping: dict[str, list[str]], canonical: str) -> str:
    if rng.random() < 0.72:
        return canonical
    return rng.choice(mapping[canonical])


def build_claims(
    rng: random.Random,
    members: list[dict],
    providers: list[Provider],
) -> tuple[list[dict], list[dict], list[dict]]:
    headers: list[dict] = []
    lines: list[dict] = []
    events: list[dict] = []
    event_seq = 1
    payer_weights = [0.24, 0.18, 0.16, 0.17, 0.15, 0.10]

    def add_event(claim_id: str, event_type: str, ts: datetime, denial: str = "", notes: str = "", actor: str = "system") -> None:
        nonlocal event_seq
        events.append(
            {
                "event_id": f"EVT-{event_seq:08d}",
                "claim_id": claim_id,
                "event_type": canonical_or_alias(rng, EVENT_ALIASES, event_type),
                "event_ts": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "event_date": ts.date().isoformat(),
                "denial_reason_code": denial,
                "notes": notes,
                "actor_type": actor,
                "ingest_ts": (ts + timedelta(hours=rng.randint(0, 6))).strftime("%Y-%m-%d %H:%M:%S"),
            }
        )
        event_seq += 1

    for i in range(1, N_CLAIMS + 1):
        provider = rng.choice(providers)
        member = rng.choice(members)
        payer = rng.choices(PAYERS, weights=payer_weights, k=1)[0]
        service = specialty_service(provider.specialty, rng)
        service_date = pick_service_date(rng)
        submit_lag = rng.randint(1, 18)
        if rng.random() < 0.015:
            submit_lag = rng.randint(95, 140)
        submission_date = min(service_date + timedelta(days=submit_lag), AS_OF)
        late_file = submit_lag > 90

        claim_id = f"CLM-{service_date.year}-{i:07d}"
        n_lines = 1 if rng.random() < 0.55 else rng.randint(2, 4)
        line_services = [service] + [specialty_service(provider.specialty, rng) for _ in range(n_lines - 1)]
        billed_total = 0.0
        allowed_total = 0.0
        diagnosis_group = rng.choice(DIAGNOSIS_GROUPS)
        if service["category"] == "Behavioral Health":
            diagnosis_group = "Behavioral"
        if service["category"] == "Cardiology":
            diagnosis_group = "Cardiac"
        if service["category"] in {"Surgery", "Physical Therapy"} and rng.random() < 0.6:
            diagnosis_group = "Orthopedic"

        line_rows = []
        for line_no, svc in enumerate(line_services, start=1):
            billed = jitter_amount(rng, svc["billed"])
            allowed = round(billed * rng.uniform(0.52, 0.82), 2)
            billed_total += billed
            allowed_total += allowed
            line_rows.append(
                {
                    "claim_id": claim_id,
                    "line_id": f"{claim_id}-{line_no:02d}",
                    "line_number": line_no,
                    "service_code": svc["code"],
                    "service_description": svc["desc"],
                    "service_category": svc["category"],
                    "diagnosis_code": rng.choice(DIAGNOSIS_CODES[diagnosis_group]),
                    "billed_amount": f"{billed:.2f}",
                    "allowed_amount": f"{allowed:.2f}",
                    "paid_amount": "",
                    "units": rng.choice([1, 1, 1, 2, 4]),
                    "modifier": "" if rng.random() > 0.12 else rng.choice(["25", "59", "LT", "RT", "26"]),
                    "service_date": format_date(rng, service_date),
                }
            )

        base_deny = 0.22 + payer["deny_adj"]
        if not provider.is_in_network:
            base_deny += 0.08
        if provider.pattern == "auth":
            base_deny += 0.16
        if provider.pattern == "modifier":
            base_deny += 0.10
        if provider.pattern == "clean":
            base_deny -= 0.08
        if service["category"] == "Radiology":
            base_deny += 0.05
        if late_file:
            base_deny = 0.95
        deny_p = min(max(base_deny, 0.04), 0.92)

        tat_extra = 0
        if provider.pattern == "slow":
            tat_extra += rng.randint(6, 16)
        if provider.pattern == "volume":
            tat_extra += rng.randint(2, 8)
        if payer["payer_type"] == "Medicaid":
            tat_extra += rng.randint(2, 6)
        if service["category"] == "Behavioral Health":
            tat_extra += rng.randint(4, 12)

        received_date = min(submission_date + timedelta(days=rng.randint(0, 2)), AS_OF)
        first_decision_lag = rng.randint(3, 12) + tat_extra
        first_decision_date = submission_date + timedelta(days=first_decision_lag)

        is_recent_open = (AS_OF - submission_date).days <= rng.randint(3, 20) and rng.random() < 0.55
        still_open = first_decision_date > AS_OF or is_recent_open
        voided = rng.random() < 0.008

        submit_ts = datetime.combine(submission_date, datetime.min.time()) + timedelta(hours=rng.randint(7, 16))
        received_ts = datetime.combine(received_date, datetime.min.time()) + timedelta(hours=rng.randint(8, 18))
        add_event(claim_id, "claim_submitted", submit_ts, actor="provider")
        add_event(claim_id, "claim_received", received_ts, actor="system")
        if rng.random() < 0.015:
            add_event(claim_id, "claim_received", received_ts + timedelta(minutes=rng.randint(2, 40)), actor="system")

        current_status = "submitted"
        adjudication_date = None
        payment_date = None
        paid_total = 0.0
        rework = False
        denial_code = ""
        pended = False

        if voided:
            void_date = min(received_date + timedelta(days=rng.randint(1, 8)), AS_OF)
            add_event(claim_id, "claim_voided", datetime.combine(void_date, datetime.min.time()) + timedelta(hours=10))
            current_status = "voided"
            adjudication_date = void_date
        elif still_open:
            if rng.random() < 0.35:
                pend_date = min(received_date + timedelta(days=rng.randint(1, 5)), AS_OF)
                add_event(claim_id, "claim_pended", datetime.combine(pend_date, datetime.min.time()) + timedelta(hours=11), actor="examiner")
                current_status = "pended"
                pended = True
                rework = True
            elif rng.random() < 0.5:
                current_status = "in_review"
            else:
                current_status = "submitted"
        else:
            if rng.random() < 0.16:
                pend_date = received_date + timedelta(days=rng.randint(1, 4))
                add_event(
                    claim_id,
                    "claim_pended",
                    datetime.combine(pend_date, datetime.min.time()) + timedelta(hours=11),
                    actor="examiner",
                )
                add_event(
                    claim_id,
                    "additional_info_requested",
                    datetime.combine(pend_date, datetime.min.time()) + timedelta(hours=13),
                    actor="examiner",
                    notes="Missing clinical notes or authorization",
                )
                pended = True
                rework = True
                first_decision_date = first_decision_date + timedelta(days=rng.randint(3, 10))

            denied_first = rng.random() < deny_p
            decision_ts = datetime.combine(first_decision_date, datetime.min.time()) + timedelta(hours=rng.randint(9, 17))

            if denied_first:
                denial_code = pick_denial_code(rng, provider.pattern, service["category"], late_file)
                add_event(claim_id, "claim_denied", decision_ts, denial=denial_code, actor="examiner")
                current_status = "denied"
                adjudication_date = first_decision_date
                recoverable = next(c["recoverable"] for c in DENIAL_CODES if c["code"] == denial_code)
                resubmit = recoverable and rng.random() < 0.55 and first_decision_date + timedelta(days=8) <= AS_OF
                if resubmit:
                    rework = True
                    resub_date = first_decision_date + timedelta(days=rng.randint(4, 12))
                    add_event(
                        claim_id,
                        "claim_resubmitted",
                        datetime.combine(resub_date, datetime.min.time()) + timedelta(hours=10),
                        actor="provider",
                    )
                    second_date = resub_date + timedelta(days=rng.randint(3, 10) + tat_extra // 2)
                    if second_date <= AS_OF and rng.random() < 0.62:
                        add_event(
                            claim_id,
                            "claim_approved",
                            datetime.combine(second_date, datetime.min.time()) + timedelta(hours=15),
                            actor="examiner",
                        )
                        current_status = "approved"
                        adjudication_date = second_date
                    elif second_date <= AS_OF:
                        add_event(
                            claim_id,
                            "claim_denied",
                            datetime.combine(second_date, datetime.min.time()) + timedelta(hours=15),
                            denial=denial_code,
                            actor="examiner",
                        )
                        current_status = "denied"
                        adjudication_date = second_date
                    else:
                        current_status = "in_review"
                        adjudication_date = None
            else:
                add_event(claim_id, "claim_approved", decision_ts, actor="examiner")
                current_status = "approved"
                adjudication_date = first_decision_date

            if current_status == "approved":
                pay_lag = payer["pay_lag"] + rng.randint(-2, 6)
                if pay_lag < 2:
                    pay_lag = 2
                pay_date = adjudication_date + timedelta(days=pay_lag)
                if pay_date <= AS_OF:
                    allowed_ratio = rng.uniform(0.88, 1.0)
                    paid_total = round(allowed_total * allowed_ratio, 2)
                    add_event(
                        claim_id,
                        "payment_issued",
                        datetime.combine(pay_date, datetime.min.time()) + timedelta(hours=8),
                        actor="system",
                    )
                    current_status = "paid"
                    payment_date = pay_date
                    if rng.random() < 0.02:
                        adj_date = pay_date + timedelta(days=rng.randint(3, 20))
                        if adj_date <= AS_OF:
                            add_event(
                                claim_id,
                                "payment_adjusted",
                                datetime.combine(adj_date, datetime.min.time()) + timedelta(hours=9),
                                actor="examiner",
                                notes="Post-payment adjustment",
                            )
                            paid_total = round(paid_total * rng.uniform(0.85, 1.05), 2)

        remaining_paid = paid_total
        for idx, line in enumerate(line_rows):
            allowed = float(line["allowed_amount"])
            if current_status == "paid":
                if idx == len(line_rows) - 1:
                    line_paid = round(remaining_paid, 2)
                else:
                    share = allowed / allowed_total if allowed_total else 0
                    line_paid = round(paid_total * share, 2)
                    remaining_paid -= line_paid
                line["paid_amount"] = f"{line_paid:.2f}"
            else:
                line["paid_amount"] = "0.00"
            lines.append(line)

        billed_out = billed_total
        allowed_out = allowed_total
        paid_out = paid_total
        member_id = member["member_id"]
        if rng.random() < 0.001:
            member_id = ""
        if rng.random() < 0.002:
            billed_out = -abs(billed_out)
        if rng.random() < 0.005 and paid_out > 0:
            paid_out = round(billed_out * rng.uniform(1.08, 1.35), 2)

        ingest = datetime.combine(min(submission_date + timedelta(days=1), AS_OF), datetime.min.time())
        headers.append(
            {
                "claim_id": f" {claim_id} " if rng.random() < 0.004 else claim_id,
                "member_id": member_id,
                "provider_id": provider.provider_id,
                "payer_id": payer["payer_id"],
                "payer_name": payer["payer_name"],
                "payer_type": payer["payer_type"],
                "service_date": format_date(rng, service_date),
                "submission_date": format_date(rng, submission_date),
                "adjudication_date": format_date(rng, adjudication_date),
                "payment_date": format_date(rng, payment_date),
                "billed_amount": f"{billed_out:.2f}",
                "allowed_amount": f"{allowed_out:.2f}",
                "paid_amount": f"{paid_out:.2f}",
                "claim_status": canonical_or_alias(rng, STATUS_ALIASES, current_status),
                "diagnosis_group": diagnosis_group,
                "place_of_service": rng.choice(PLACE_OF_SERVICE),
                "rework_flag": rng.choice(REWORK_ALIASES[rework or pended]),
                "primary_service_category": service["category"],
                "ingest_ts": ingest.strftime("%Y-%m-%d %H:%M:%S"),
                "source_file": f"claims_extract_{submission_date.strftime('%Y%m')}.csv",
            }
        )

    # Duplicate a small share of headers and events to mimic extract reloads.
    dup_headers = [dict(row) for row in rng.sample(headers, k=max(40, len(headers) // 400))]
    for row in dup_headers:
        row["ingest_ts"] = (
            datetime.fromisoformat(row["ingest_ts"]) + timedelta(hours=rng.randint(2, 20))
        ).strftime("%Y-%m-%d %H:%M:%S")
    headers.extend(dup_headers)

    return headers, lines, events


def main() -> None:
    args = parse_args()
    rng = random.Random(args.seed)
    output_dir = Path(args.output_dir)

    providers = build_providers(rng)
    members = build_members(rng)
    headers, lines, events = build_claims(rng, members, providers)

    write_csv(
        output_dir / "raw_payers.csv",
        PAYERS,
        ["payer_id", "payer_name", "payer_type", "pay_lag", "deny_adj"],
    )
    write_csv(
        output_dir / "raw_denial_codes.csv",
        [
            {
                "denial_reason_code": c["code"],
                "denial_description": c["desc"],
                "denial_category": c["category"],
                "is_technical": str(c["technical"]).lower(),
                "is_recoverable": str(c["recoverable"]).lower(),
            }
            for c in DENIAL_CODES
        ],
        ["denial_reason_code", "denial_description", "denial_category", "is_technical", "is_recoverable"],
    )
    write_csv(
        output_dir / "raw_providers.csv",
        [
            {
                "provider_id": p.provider_id,
                "npi": p.npi,
                "provider_name": p.provider_name,
                "provider_group": p.provider_group,
                "specialty": p.specialty or "",
                "city": p.city,
                "state": p.state,
                "region": p.region,
                "tin": p.tin,
                "is_in_network": str(p.is_in_network).lower(),
            }
            for p in providers
        ],
        ["provider_id", "npi", "provider_name", "provider_group", "specialty", "city", "state", "region", "tin", "is_in_network"],
    )
    write_csv(
        output_dir / "raw_members.csv",
        members,
        ["member_id", "member_age_band", "gender", "plan_type", "region", "enrollment_date", "product_line"],
    )
    write_csv(
        output_dir / "raw_claim_headers.csv",
        headers,
        [
            "claim_id",
            "member_id",
            "provider_id",
            "payer_id",
            "payer_name",
            "payer_type",
            "service_date",
            "submission_date",
            "adjudication_date",
            "payment_date",
            "billed_amount",
            "allowed_amount",
            "paid_amount",
            "claim_status",
            "diagnosis_group",
            "place_of_service",
            "rework_flag",
            "primary_service_category",
            "ingest_ts",
            "source_file",
        ],
    )
    write_csv(
        output_dir / "raw_claim_lines.csv",
        lines,
        [
            "claim_id",
            "line_id",
            "line_number",
            "service_code",
            "service_description",
            "service_category",
            "diagnosis_code",
            "billed_amount",
            "allowed_amount",
            "paid_amount",
            "units",
            "modifier",
            "service_date",
        ],
    )
    write_csv(
        output_dir / "raw_claim_events.csv",
        events,
        [
            "event_id",
            "claim_id",
            "event_type",
            "event_ts",
            "event_date",
            "denial_reason_code",
            "notes",
            "actor_type",
            "ingest_ts",
        ],
    )

    print(f"Wrote extracts to {output_dir.resolve()}")
    print(f"  providers: {len(providers)}")
    print(f"  members:   {len(members)}")
    print(f"  headers:   {len(headers)} (includes intentional duplicates)")
    print(f"  lines:     {len(lines)}")
    print(f"  events:    {len(events)}")


if __name__ == "__main__":
    main()
