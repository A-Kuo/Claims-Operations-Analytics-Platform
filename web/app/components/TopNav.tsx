"use client";

import { Activity, Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/" },
  { label: "Denials & Rework", href: "/denials-rework" },
  { label: "Provider & Service", href: "/provider-service" },
  { label: "Claim Journey", href: "/claim-journey" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-card">
            <Activity className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">
            ClaimPulse <span className="text-slate-400">Analytics</span>
          </span>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-1 rounded-full bg-slate-100 p-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors ${
                  isActive
                    ? "bg-white text-sky-700 shadow-card"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 text-slate-400 lg:flex">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search claims…</span>
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300" />
        </div>
      </div>
    </header>
  );
}
