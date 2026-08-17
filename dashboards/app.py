"""Claims operations dashboard. Reads local DuckDB marts only."""

from __future__ import annotations

from pathlib import Path

import duckdb
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "target" / "claims_ops.duckdb"
AS_OF = pd.Timestamp("2026-08-17")
SLA_DAYS = 14

ACCENT = "#0F4C5C"
ALERT = "#9B1C1C"
WATCH = "#B54708"
OK = "#0E7C4A"
MUTED = "#5C6775"
GRID = "#E4E7EB"

PLOT_LAYOUT = dict(
    paper_bgcolor="white",
    plot_bgcolor="white",
    font=dict(color="#1C2430", size=13, family="IBM Plex Sans, Segoe UI, sans-serif"),
    margin=dict(l=16, r=16, t=48, b=16),
    legend=dict(orientation="h", yanchor="bottom", y=1.02, x=0),
)


def style_fig(fig: go.Figure) -> go.Figure:
    fig.update_layout(**PLOT_LAYOUT)
    fig.update_xaxes(showgrid=False, linecolor=GRID)
    fig.update_yaxes(gridcolor=GRID, zeroline=False)
    return fig


@st.cache_resource
def connect():
    if not DB_PATH.exists():
        return None
    return duckdb.connect(str(DB_PATH), read_only=True)


@st.cache_data(show_spinner=False)
def load_tables() -> dict[str, pd.DataFrame]:
    con = connect()
    if con is None:
        return {}
    tables = {
        "claims": "select * from marts.fct_claims",
        "providers": "select provider_id, provider_name, provider_group, specialty from marts.dim_provider",
        "payers": "select payer_id, payer_name, payer_type from marts.dim_payer",
        "denials": "select * from marts.fct_denials",
        "reasons": "select * from marts.dim_denial_reason",
        "events": "select event_type, event_date, claim_id from marts.fct_claim_events",
        "quality": "select * from marts.mart_data_quality_exceptions",
        "scorecard": "select * from marts.mart_provider_claim_quality",
        "group_score": "select * from marts.mart_provider_performance",
    }
    return {name: con.execute(sql).df() for name, sql in tables.items()}


def fmt_int(value: float) -> str:
    return f"{int(value):,}"


def fmt_pct(value: float) -> str:
    if pd.isna(value):
        return "—"
    return f"{value:.1%}"


def fmt_days(value: float) -> str:
    if pd.isna(value):
        return "—"
    return f"{value:.1f} d"


def apply_filters(claims: pd.DataFrame, providers: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    frame = claims.merge(providers, on="provider_id", how="left")
    frame["submission_date"] = pd.to_datetime(frame["submission_date"])
    min_date = frame["submission_date"].min().date()
    max_date = frame["submission_date"].max().date()

    st.sidebar.markdown("**Filters**")
    date_range = st.sidebar.date_input(
        "Submission date",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date,
    )
    payer_types = sorted(frame["payer_type"].dropna().unique())
    selected_payers = st.sidebar.multiselect("Payer type", payer_types, default=payer_types)
    groups = sorted(frame["provider_group"].dropna().unique())
    selected_groups = st.sidebar.multiselect("Provider group", groups, default=[])
    categories = sorted(frame["service_category"].dropna().unique())
    selected_categories = st.sidebar.multiselect("Service category", categories, default=[])

    if isinstance(date_range, tuple) and len(date_range) == 2:
        start, end = date_range
        frame = frame[(frame["submission_date"].dt.date >= start) & (frame["submission_date"].dt.date <= end)]
    if selected_payers:
        frame = frame[frame["payer_type"].isin(selected_payers)]
    if selected_groups:
        frame = frame[frame["provider_group"].isin(selected_groups)]
    if selected_categories:
        frame = frame[frame["service_category"].isin(selected_categories)]

    kpi = frame[frame["is_kpi_eligible"]]
    return kpi, {
        "payer_types": selected_payers,
        "groups": selected_groups,
        "categories": selected_categories,
    }


def kpi_row(claims: pd.DataFrame) -> None:
    submitted = len(claims)
    open_claims = int(claims["is_open"].sum())
    denial_rate = claims["ever_denied"].mean() if submitted else None
    tat = claims.loc[claims["turnaround_days"].notna(), "turnaround_days"].mean()
    pay_lag = claims.loc[claims["payment_lag_days"].notna(), "payment_lag_days"].mean()
    sla = claims["is_adjudication_sla_breach"].mean() if submitted else None
    cols = st.columns(6)
    cols[0].metric("Claim volume", fmt_int(submitted))
    cols[1].metric("Open backlog", fmt_int(open_claims))
    cols[2].metric("Avg turnaround", fmt_days(tat))
    cols[3].metric("Denial rate", fmt_pct(denial_rate))
    cols[4].metric("Payment lag", fmt_days(pay_lag))
    cols[5].metric("SLA breach rate", fmt_pct(sla))


def page_overview(claims: pd.DataFrame, quality: pd.DataFrame) -> None:
    st.subheader("Operations overview")
    st.caption(f"As of {AS_OF.date()} · 14-day first-pass adjudication SLA · 7-day payment SLA")
    kpi_row(claims)

    daily = (
        claims.groupby(claims["submission_date"].dt.to_period("W").dt.start_time)
        .agg(
            submitted=("claim_id", "count"),
            denied=("ever_denied", "sum"),
            open_claims=("is_open", "sum"),
        )
        .reset_index()
        .rename(columns={"submission_date": "week_start"})
    )
    trend = px.line(
        daily,
        x="week_start",
        y=["submitted", "denied", "open_claims"],
        labels={"value": "Claims", "week_start": "Week starting", "variable": ""},
        title="Weekly submissions, denials, and claims from that week still open",
    )
    trend.update_traces(line=dict(width=2))
    colors = {"submitted": ACCENT, "denied": ALERT, "open_claims": WATCH}
    for trace in trend.data:
        trace.line.color = colors.get(trace.name, ACCENT)
    st.plotly_chart(style_fig(trend), use_container_width=True)

    left, right = st.columns(2)
    by_payer = (
        claims.groupby("payer_type")
        .agg(claims=("claim_id", "count"), avg_tat=("turnaround_days", "mean"), denial_rate=("ever_denied", "mean"))
        .reset_index()
        .sort_values("claims", ascending=False)
    )
    payer_fig = px.bar(
        by_payer,
        x="payer_type",
        y="claims",
        title="Volume by payer type",
        labels={"payer_type": "Payer type", "claims": "Claims"},
        color_discrete_sequence=[ACCENT],
    )
    left.plotly_chart(style_fig(payer_fig), use_container_width=True)

    backlog = claims[claims["is_open"]].copy()
    if not backlog.empty:
        backlog["bucket"] = pd.cut(
            backlog["days_in_inventory"],
            bins=[-1, 7, SLA_DAYS, 30, 999],
            labels=["0-7 days", "8-14 days", "15-30 days", "31+ days"],
        )
        age = backlog.groupby("bucket", observed=False).size().reset_index(name="open_claims")
        age_fig = px.bar(
            age,
            x="bucket",
            y="open_claims",
            title="Open inventory by age",
            labels={"bucket": "Age", "open_claims": "Open claims"},
            color="bucket",
            color_discrete_map={
                "0-7 days": OK,
                "8-14 days": ACCENT,
                "15-30 days": WATCH,
                "31+ days": ALERT,
            },
        )
        age_fig.update_layout(showlegend=False)
        right.plotly_chart(style_fig(age_fig), use_container_width=True)

    st.markdown("**Extract defects retained in staging**")
    st.dataframe(quality, hide_index=True, use_container_width=True)


def page_denials(claims: pd.DataFrame, denials: pd.DataFrame, reasons: pd.DataFrame) -> None:
    st.subheader("Denials and rework")
    claim_ids = set(claims["claim_id"])
    denials = denials[denials["claim_id"].isin(claim_ids)].merge(reasons, on="denial_reason_code", how="left")
    denials["denied_date"] = pd.to_datetime(denials["denied_date"])

    reason_filter = st.multiselect(
        "Denial reason",
        sorted(denials["denial_description"].dropna().unique()),
    )
    if reason_filter:
        denials = denials[denials["denial_description"].isin(reason_filter)]

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Denial rate", fmt_pct(claims["ever_denied"].mean()))
    c2.metric("Rework rate", fmt_pct(claims["is_rework"].mean()))
    c3.metric("First-pass resolution", fmt_pct(claims["is_first_pass_resolved"].mean()))
    c4.metric("Denial recovery", fmt_pct(claims["is_denial_recovered"].mean()))

    monthly = (
        denials.groupby([denials["denied_date"].dt.to_period("M").dt.start_time, "denial_description"])
        .size()
        .reset_index(name="denial_events")
        .rename(columns={"denied_date": "month"})
    )
    top_reasons = monthly.groupby("denial_description")["denial_events"].sum().nlargest(6).index
    monthly = monthly[monthly["denial_description"].isin(top_reasons)]
    reason_fig = px.line(
        monthly,
        x="month",
        y="denial_events",
        color="denial_description",
        title="Top denial reasons over time",
        labels={"month": "Month", "denial_events": "Denial events", "denial_description": "Reason"},
        color_discrete_sequence=px.colors.qualitative.D3,
    )
    st.plotly_chart(style_fig(reason_fig), use_container_width=True)

    heat_base = claims.groupby(["provider_group", "service_category"], dropna=False).agg(
        rework_rate=("is_rework", "mean"),
        n=("claim_id", "count"),
    ).reset_index()
    keep_groups = heat_base.groupby("provider_group")["n"].sum()
    keep_groups = keep_groups[keep_groups >= 200].index
    heat = (
        heat_base[heat_base["provider_group"].isin(keep_groups)]
        .pivot(index="provider_group", columns="service_category", values="rework_rate")
    )
    heat_fig = px.imshow(
        heat,
        aspect="auto",
        color_continuous_scale=["#F3F5F7", WATCH, ALERT],
        title="Rework rate by provider group and service category",
        labels={"color": "Rework rate"},
    )
    st.plotly_chart(style_fig(heat_fig), use_container_width=True)

    bottlenecks = (
        claims.groupby("provider_group")
        .agg(
            claims=("claim_id", "count"),
            denial_rate=("ever_denied", "mean"),
            rework_rate=("is_rework", "mean"),
            avg_tat=("turnaround_days", "mean"),
            open_claims=("is_open", "sum"),
        )
        .reset_index()
        .sort_values("denial_rate", ascending=False)
        .head(12)
    )
    bottlenecks["denial_rate"] = bottlenecks["denial_rate"].map(lambda x: f"{x:.1%}")
    bottlenecks["rework_rate"] = bottlenecks["rework_rate"].map(lambda x: f"{x:.1%}")
    bottlenecks["avg_tat"] = bottlenecks["avg_tat"].map(lambda x: f"{x:.1f}")
    st.markdown("**Highest-denial provider groups**")
    st.dataframe(bottlenecks, hide_index=True, use_container_width=True)


def page_providers(claims: pd.DataFrame, scorecard: pd.DataFrame) -> None:
    st.subheader("Provider and service performance")
    ids = set(claims["provider_id"])
    scorecard = scorecard[scorecard["provider_id"].isin(ids)].copy()

    c1, c2, c3 = st.columns(3)
    c1.metric("High-risk providers", fmt_int((scorecard["risk_bucket"] == "high").sum()))
    c2.metric("Watch list", fmt_int((scorecard["risk_bucket"] == "watch").sum()))
    c3.metric("In control", fmt_int((scorecard["risk_bucket"] == "in_control").sum()))

    service = (
        claims.groupby("service_category")
        .agg(
            claims=("claim_id", "count"),
            denial_rate=("ever_denied", "mean"),
            avg_tat=("turnaround_days", "mean"),
            paid_to_billed=("paid_to_billed_ratio", "mean"),
            rework_rate=("is_rework", "mean"),
        )
        .reset_index()
        .sort_values("claims", ascending=False)
    )
    svc_fig = px.bar(
        service,
        x="service_category",
        y="denial_rate",
        title="Denial rate by service category",
        labels={"service_category": "Service category", "denial_rate": "Denial rate"},
        color="denial_rate",
        color_continuous_scale=["#D7E3E6", ALERT],
    )
    st.plotly_chart(style_fig(svc_fig), use_container_width=True)

    variance = (
        claims.groupby("service_category")
        .agg(billed=("billed_amount", "sum"), paid=("paid_amount", "sum"), allowed=("allowed_amount", "sum"))
        .reset_index()
    )
    var_fig = go.Figure()
    var_fig.add_bar(name="Billed", x=variance["service_category"], y=variance["billed"], marker_color="#9AA7B2")
    var_fig.add_bar(name="Allowed", x=variance["service_category"], y=variance["allowed"], marker_color=ACCENT)
    var_fig.add_bar(name="Paid", x=variance["service_category"], y=variance["paid"], marker_color=OK)
    var_fig.update_layout(barmode="group", title="Billed vs allowed vs paid")
    st.plotly_chart(style_fig(var_fig), use_container_width=True)

    outliers = scorecard.sort_values("denial_rate", ascending=False).head(15)[
        [
            "provider_name",
            "provider_group",
            "specialty",
            "claim_count",
            "denial_rate",
            "rework_rate",
            "avg_turnaround_days",
            "risk_bucket",
        ]
    ]
    show = outliers.copy()
    show["denial_rate"] = show["denial_rate"].map(lambda x: f"{x:.1%}")
    show["rework_rate"] = show["rework_rate"].map(lambda x: f"{x:.1%}")
    show["avg_turnaround_days"] = show["avg_turnaround_days"].map(lambda x: f"{x:.1f}")
    st.markdown("**Outlier providers by denial rate**")
    st.dataframe(show, hide_index=True, use_container_width=True)


def page_journey(claims: pd.DataFrame, events: pd.DataFrame) -> None:
    st.subheader("Claim journey")
    status_order = ["submitted", "in_review", "pended", "approved", "denied", "paid", "voided"]
    funnel = (
        claims["current_status"].value_counts().reindex(status_order).fillna(0).reset_index()
    )
    funnel.columns = ["status", "claims"]
    funnel_fig = px.bar(
        funnel,
        x="claims",
        y="status",
        orientation="h",
        title="Current-status funnel",
        labels={"claims": "Claims", "status": "Status"},
        color_discrete_sequence=[ACCENT],
    )
    st.plotly_chart(style_fig(funnel_fig), use_container_width=True)

    event_order = [
        "claim_submitted",
        "claim_received",
        "claim_pended",
        "additional_info_requested",
        "claim_denied",
        "claim_resubmitted",
        "claim_approved",
        "payment_issued",
    ]
    claim_ids = set(claims["claim_id"])
    ev = events[events["claim_id"].isin(claim_ids)].copy()
    ev["event_date"] = pd.to_datetime(ev["event_date"])
    weekly = (
        ev[ev["event_type"].isin(event_order)]
        .groupby([ev["event_date"].dt.to_period("W").dt.start_time, "event_type"])
        .size()
        .reset_index(name="events")
        .rename(columns={"event_date": "week_start"})
    )
    ev_fig = px.area(
        weekly,
        x="week_start",
        y="events",
        color="event_type",
        title="Lifecycle events by week",
        labels={"week_start": "Week starting", "events": "Events", "event_type": "Event"},
        color_discrete_sequence=px.colors.qualitative.Set2,
    )
    st.plotly_chart(style_fig(ev_fig), use_container_width=True)

    paths = claims.copy()
    paths["path"] = "Submitted"
    paths.loc[paths["ever_denied"], "path"] = "Submitted → Denied"
    paths.loc[paths["is_denial_recovered"], "path"] = "Submitted → Denied → Recovered"
    paths.loc[paths["is_first_pass_resolved"], "path"] = "Submitted → Approved first pass"
    paths.loc[paths["is_open"], "path"] = "Submitted → Still open"
    path_counts = paths["path"].value_counts().reset_index()
    path_counts.columns = ["path", "claims"]
    st.markdown("**Common delay and failure paths**")
    st.dataframe(path_counts, hide_index=True, use_container_width=True)

    lag = claims.loc[claims["turnaround_days"].notna(), ["turnaround_days", "payment_lag_days"]].copy()
    hist = px.histogram(
        lag,
        x="turnaround_days",
        nbins=40,
        title="Turnaround time distribution (submission to adjudication)",
        labels={"turnaround_days": "Turnaround days", "count": "Claims"},
        color_discrete_sequence=[ACCENT],
    )
    hist.add_vline(x=SLA_DAYS, line_dash="dash", line_color=ALERT, annotation_text="14-day SLA")
    st.plotly_chart(style_fig(hist), use_container_width=True)


def main() -> None:
    st.set_page_config(page_title="Claims Operations Analytics", layout="wide")
    st.markdown(
        """
        <style>
        .block-container {padding-top: 1.4rem; max-width: 1400px;}
        h1 {font-size: 1.6rem; font-weight: 650; letter-spacing: -0.02em;}
        [data-testid="stMetricValue"] {font-size: 1.35rem;}
        </style>
        """,
        unsafe_allow_html=True,
    )
    st.title("Claims Operations Analytics")
    st.caption("Northstar Health Plan · synthetic operational extract · local DuckDB marts")

    data = load_tables()
    if not data:
        st.error("Warehouse not found. From the repo root run: python scripts/run_pipeline.py")
        st.stop()

    claims, _filters = apply_filters(data["claims"], data["providers"])
    if claims.empty:
        st.warning("No claims in the current filter set.")
        st.stop()

    page = st.sidebar.radio(
        "Page",
        ["Operations overview", "Denials and rework", "Provider and service", "Claim journey"],
    )
    if page == "Operations overview":
        page_overview(claims, data["quality"])
    elif page == "Denials and rework":
        page_denials(claims, data["denials"], data["reasons"])
    elif page == "Provider and service":
        page_providers(claims, data["scorecard"])
    else:
        page_journey(claims, data["events"])


if __name__ == "__main__":
    main()
