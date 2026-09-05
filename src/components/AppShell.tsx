"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated, useStats } from "@/lib/hooks";
import { useSync } from "./SyncProvider";

const NAV = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/mountains", label: "山リスト", icon: "🔍" },
  { href: "/map", label: "日本地図", icon: "🗾" },
  { href: "/achievements", label: "実績", icon: "🏅" },
  { href: "/records", label: "記録", icon: "📖" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const stats = useStats();
  const hydrated = useHydrated();
  const sync = useSync();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--page)]/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>⛰️</span>
            <span className="text-base font-black tracking-tight">ヤマコンプ</span>
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-1 sm:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive(pathname, item.href)
                    ? "bg-[var(--brand)] text-white"
                    : "text-ink-muted hover:bg-[var(--surface-2)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold tabular-nums text-ink-muted sm:inline">
              {hydrated ? stats.totalClimbed : "-"} / {stats.totalMountains} 座
            </span>
            <Link
              href="/account"
              aria-label="アカウントと同期"
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-base transition ${
                isActive(pathname, "/account")
                  ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                  : "border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {sync.syncKey ? "☁️" : "👤"}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-4 sm:pb-10">{children}</main>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur sm:hidden">
        <ul className="mx-auto flex max-w-lg">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold transition ${
                    active ? "text-[var(--brand)]" : "text-ink-subtle"
                  }`}
                >
                  <span className={`text-lg leading-none ${active ? "scale-110" : ""}`} aria-hidden>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
