"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MOUNTAIN_BY_ID } from "@/data/mountains";
import { useHydrated, useStats } from "@/lib/hooks";
import { Card, Chip, EmptyState, SectionTitle, Stat } from "./ui";
import type { Ascent } from "@/lib/types";

function monthKeysBack(n: number) {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < n; i += 1) {
    out.unshift(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    d.setMonth(d.getMonth() - 1);
  }
  return out;
}

export function RecordsView() {
  const stats = useStats();
  const hydrated = useHydrated();

  const grouped = useMemo(() => {
    const map = new Map<string, Ascent[]>();
    for (const a of stats.ascents) {
      const key = a.date ? a.date.slice(0, 4) : "日付なし";
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [stats.ascents]);

  const monthCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const a of stats.ascents) {
      if (!a.date) continue;
      const k = a.date.slice(0, 7);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return counts;
  }, [stats.ascents]);

  const topPrefs = useMemo(
    () =>
      stats.visitedPrefectures
        .map((p) => ({ p, prog: stats.byPrefecture[p] }))
        .sort((a, b) => b.prog.climbed - a.prog.climbed)
        .slice(0, 5),
    [stats],
  );

  if (!hydrated) {
    return <div className="card flex h-64 items-center justify-center text-sm text-ink-muted">読み込み中…</div>;
  }

  const maxYear = Math.max(1, ...stats.yearCounts.map((y) => y.count));
  const months = monthKeysBack(12);
  const maxMonth = Math.max(1, ...months.map((m) => monthCounts.get(m) ?? 0));

  return (
    <div>
      <h1 className="mb-3 text-lg font-black">記録</h1>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="登頂した山" value={`${stats.totalClimbed}座`} />
        <Stat label="登頂回数" value={`${stats.totalAscents}回`} />
        <Stat label="活動日数" value={`${stats.activeDays}日`} />
        <Stat label="累積標高" value={`${stats.cumulativeElevation.toLocaleString()}m`} />
      </div>

      {stats.highestMountain ? (
        <>
          <SectionTitle title="自己ベスト" />
          <Card className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-ink-muted">最高到達点</span>
              <Link href={`/mountains/${stats.highestMountain.id}`} className="font-black">
                {stats.highestMountain.name}{" "}
                <span className="tabular-nums text-[var(--brand-strong)]">
                  {stats.highestMountain.elevation.toLocaleString()}m
                </span>
              </Link>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-ink-muted">はじめての記録</span>
              <span className="font-black tabular-nums">{stats.firstAscentDate ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-ink-muted">最新の記録</span>
              <span className="font-black tabular-nums">{stats.latestAscentDate ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-bold text-ink-muted">連続登山</span>
              <span className="font-black tabular-nums">{stats.monthStreak} か月</span>
            </div>
          </Card>
        </>
      ) : null}

      {stats.ascents.length > 0 ? (
        <>
          <SectionTitle title="この1年の登山ペース" />
          <Card>
            <div className="flex h-28 items-end gap-1">
              {months.map((m) => {
                const c = monthCounts.get(m) ?? 0;
                return (
                  <div key={m} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t"
                        style={{
                          height: `${(c / maxMonth) * 100}%`,
                          minHeight: c > 0 ? 4 : 2,
                          background: c > 0 ? "var(--brand)" : "var(--surface-3)",
                        }}
                        title={`${m}: ${c}回`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-ink-subtle">{Number(m.slice(5))}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <SectionTitle title="年別の登頂" />
          <Card className="space-y-2">
            {stats.yearCounts.map((y) => (
              <div key={y.year} className="flex items-center gap-2">
                <span className="w-12 shrink-0 text-xs font-black tabular-nums">{y.year}</span>
                <div className="h-4 flex-1 overflow-hidden rounded-full bg-[var(--surface-3)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand)]"
                    style={{ width: `${(y.count / maxYear) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-black tabular-nums text-ink-muted">
                  {y.count}
                </span>
              </div>
            ))}
          </Card>

          <SectionTitle title="よく登っている都道府県" />
          <Card className="flex flex-wrap gap-1.5">
            {topPrefs.map(({ p, prog }) => (
              <Link key={p} href={`/mountains?pref=${encodeURIComponent(p)}`}>
                <Chip tone="brand">
                  {p} {prog.climbed}座
                </Chip>
              </Link>
            ))}
          </Card>
        </>
      ) : null}

      <SectionTitle title="登山の記録" hint="タップすると山のページへ移動します" />
      {stats.ascents.length === 0 ? (
        <EmptyState
          emoji="📖"
          title="まだ記録がありません"
          body="山リストから登った山にチェックを入れると、ここに記録が並びます。"
        />
      ) : (
        <div className="space-y-4">
          {grouped.map(([year, items]) => (
            <div key={year}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-sm font-black">{year === "日付なし" ? year : `${year}年`}</h3>
                <Chip tone="outline">{items.length}件</Chip>
              </div>
              <ul className="space-y-2">
                {items.map((a) => {
                  const m = MOUNTAIN_BY_ID.get(a.mountainId);
                  if (!m) return null;
                  return (
                    <li key={a.id}>
                      <Link href={`/mountains/${m.id}`} className="card block p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black tabular-nums text-ink-subtle">
                            {a.date ? a.date.slice(5).replace("-", "/") : "--/--"}
                          </span>
                          <span className="truncate text-sm font-black">{m.name}</span>
                          <span className="shrink-0 text-[11px] font-bold tabular-nums text-[var(--brand-strong)]">
                            {m.elevation.toLocaleString()}m
                          </span>
                          {a.weather ? <Chip>{a.weather}</Chip> : null}
                          {a.rating ? <span className="ml-auto text-[11px]">{"⭐".repeat(a.rating)}</span> : null}
                        </div>
                        <p className="mt-0.5 text-[11px] text-ink-subtle">
                          {m.prefectures.join("・")} / {m.municipalities[0]}
                        </p>
                        {a.note ? (
                          <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-ink-muted">{a.note}</p>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
