"use client";

import { ChevronDown, Download, Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  rangeLabel?: string;
  exportFilename: string;
  exportHeaders: string[];
  exportRows: (string | number | null)[][];
}

function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null)[][]
) {
  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => cell ?? "").join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function PageHeader({
  title,
  subtitle,
  rangeLabel = "Last 12 weeks",
  exportFilename,
  exportHeaders,
  exportRows,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-card hover:bg-slate-50"
        >
          {rangeLabel}
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
        <button
          type="button"
          onClick={() => downloadCsv(exportFilename, exportHeaders, exportRows)}
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
