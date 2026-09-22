"use client";

import { Activity, Bell, Github } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GITHUB_REPO_URL } from "../lib/links";
import SearchBox from "./SearchBox";

const NAV_ITEMS = [
  { label: "Overview", href: "/overview" },
  { label: "Denials & Rework", href: "/denials-rework" },
  { label: "Provider & Service", href: "/provider-service" },
  { label: "Claim Journey", href: "/claim-journey" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <Link
          href="/"
          aria-label="ClaimPulse Analytics home"
          className="flex items-center gap-2.5 rounded-xl transition-opacity hover:opacity-80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600 text-white shadow-card">
            <Activity className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">
            ClaimPulse <span className="text-slate-400">Analytics</span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 rounded-full bg-slate-100 p-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
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

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          <SearchBox />
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View the project on GitHub"
            title="A-Kuo/Claims-Operations-Analytics-Platform on GitHub"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 transition-colors hover:from-slate-300 hover:to-slate-400"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
