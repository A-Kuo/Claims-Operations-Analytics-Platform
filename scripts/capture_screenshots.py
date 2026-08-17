"""Render static dashboard screenshots from local DuckDB marts."""

from __future__ import annotations

from pathlib import Path

import duckdb
import matplotlib.pyplot as plt
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "target" / "claims_ops.duckdb"
OUT = ROOT / "screenshots"
ACCENT = "#0F4C5C"
ALERT = "#9B1C1C"
WATCH = "#B54708"
INK = "#1C2430"
SLA_DAYS = 14

plt.rcParams.update(
    {
        "font.family": "Segoe UI",
        "axes.edgecolor": "#D0D5DD",
        "axes.labelcolor": INK,
        "xtick.color": INK,
        "ytick.color": INK,
        "figure.facecolor": "white",
        "axes.facecolor": "white",
        "axes.grid": True,
        "grid.color": "#EEF1F4",
        "grid.linewidth": 0.8,
        "axes.spines.top": False,
        "axes.spines.right": False,
    }
)


def save(fig: plt.Figure, name: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / name
    fig.savefig(path, dpi=160, bbox_inches="tight")
    plt.close(fig)
    print(f"wrote {path}")


def main() -> None:
    con = duckdb.connect(str(DB_PATH), read_only=True)
    claims = con.execute(
        """
        select c.*, p.provider_group
        from marts.fct_claims c
        join marts.dim_provider p using (provider_id)
        where c.is_kpi_eligible
        """
    ).df()
    claims["submission_date"] = pd.to_datetime(claims["submission_date"])
    denials = con.execute(
        """
        select d.*, r.denial_description
        from marts.fct_denials d
        join marts.dim_denial_reason r using (denial_reason_code)
        """
    ).df()
    denials["denied_date"] = pd.to_datetime(denials["denied_date"])

    weekly = (
        claims.groupby(claims["submission_date"].dt.to_period("W").dt.start_time)
        .agg(submitted=("claim_id", "count"), denied=("ever_denied", "sum"), open_claims=("is_open", "sum"))
        .reset_index()
        .rename(columns={"submission_date": "week_start"})
    )
    fig, ax = plt.subplots(figsize=(12.5, 6.2))
    ax.plot(weekly["week_start"], weekly["submitted"], color=ACCENT, lw=2.2, label="Submitted")
    ax.plot(weekly["week_start"], weekly["denied"], color=ALERT, lw=2.2, label="Ever denied")
    ax.plot(weekly["week_start"], weekly["open_claims"], color=WATCH, lw=2.2, label="Still open")
    ax.set_title("Operations overview  |  weekly submissions, denials, and claims still open")
    ax.set_ylabel("Claims")
    ax.legend(frameon=False, loc="upper left")
    save(fig, "01_operations_overview.png")

    monthly = (
        denials.groupby([denials["denied_date"].dt.to_period("M").dt.start_time, "denial_description"])
        .size()
        .reset_index(name="denial_events")
        .rename(columns={"denied_date": "month"})
    )
    top = monthly.groupby("denial_description")["denial_events"].sum().nlargest(5).index
    fig, ax = plt.subplots(figsize=(12.5, 6.2))
    for reason in top:
        subset = monthly[monthly["denial_description"] == reason]
        ax.plot(subset["month"], subset["denial_events"], lw=2.1, label=reason)
    ax.set_title("Denials and rework  |  top denial reasons over time")
    ax.set_ylabel("Denial events")
    ax.legend(frameon=False, fontsize=8, loc="upper left")
    save(fig, "02_denials_and_rework.png")

    service = (
        claims.groupby("service_category")
        .agg(denial_rate=("ever_denied", "mean"), n=("claim_id", "count"))
        .reset_index()
        .sort_values("n", ascending=False)
    )
    fig, ax = plt.subplots(figsize=(12.5, 6.2))
    ax.bar(service["service_category"], service["denial_rate"], color=ACCENT)
    ax.set_title("Provider and service  |  denial rate by service category")
    ax.set_ylabel("Denial rate")
    ax.set_ylim(0, max(service["denial_rate"]) * 1.2)
    ax.tick_params(axis="x", rotation=25, labelsize=9)
    save(fig, "03_provider_service_performance.png")

    tat = claims.loc[claims["turnaround_days"].notna(), "turnaround_days"]
    fig, ax = plt.subplots(figsize=(12.5, 6.2))
    ax.hist(tat, bins=40, color=ACCENT, edgecolor="white")
    ax.axvline(SLA_DAYS, color=ALERT, ls="--", lw=1.8, label="14-day SLA")
    ax.set_title("Claim journey  |  turnaround days from submission to adjudication")
    ax.set_xlabel("Turnaround days")
    ax.set_ylabel("Claims")
    ax.legend(frameon=False)
    save(fig, "04_claim_journey.png")


if __name__ == "__main__":
    main()
