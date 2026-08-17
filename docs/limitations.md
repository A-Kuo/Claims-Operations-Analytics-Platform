# Limitations

This is a Version 1 portfolio system, not a production claims warehouse.

**Synthetic data.** Patterns were planted (authorization denials at Summit Orthopedics, slow TAT in behavioral health, slow pay at Heartland Medicaid). Do not treat rates as industry benchmarks.

**One extract, not incremental loads.** Snapshots are unused. An SCD2 claim-status history would require daily files.

**Calendar-day SLAs.** The 14-day and 7-day targets ignore weekends, holidays, and regulatory clocks that differ by line of business.

**Header vs event disagreement.** Lifecycle KPIs trust events. Header `adjudication_date` / `payment_date` can disagree after cleaning; that is a documented extract defect, not a second source of truth.

**Paid-to-billed.** Always state whether denied and open claims are in the denominator. Zeros pull the unfiltered average down to 47%.

**No PHI model.** Members have age band and region only. A real platform would add access control, audit logs, and minimum necessary columns.

**No cost accounting.** Rework cost is implied by volume, not priced with examiner FTE or appeal vendor spend.

**CI is optional.** `.github/workflows/ci.yml` runs when you push. This project does not push for you.
