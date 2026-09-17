"use client";

import { ChevronDown, Download, Plus } from "lucide-react";
import { claimRegister } from "../data/claims";

function downloadClaimRegisterCsv() {
  const header = [
    "claim_id",
    "submission_date",
    "service_category",
    "provider_group",
    "status",
    "turnaround_days",
    "risk",
  ];
  const rows = claimRegister.map((c) =>
    [
      c.claimId,
      c.submissionDate,
      c.serviceCategory,
      c.providerGroup,
      c.status,
      c.turnaroundDays ?? "",
      c.risk,
    ].join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "claim_register.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function HeaderBar() {
  return (
    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Claims Operations Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Backlog, denial, and payment-lag risk against SLA targets
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-card hover:bg-slate-50"
        >
          Last 12 weeks
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
        <button
          type="button"
          onClick={downloadClaimRegisterCsv}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-card hover:bg-slate-50"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-card-hover hover:bg-sky-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Generate Report
        </button>
      </div>
    </div>
  );
}
