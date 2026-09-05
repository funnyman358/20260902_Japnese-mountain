"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MOUNTAINS, MOUNTAIN_BY_ID } from "@/data/mountains";
import { useAchievements, useClimbedMap, useHydrated, useStats, useWishSet } from "@/lib/hooks";
import { elevationMetaphors, levelForXp, rankFor } from "@/lib/rank";
import { JapanTileMap } from "./JapanTileMap";
import { MountainItem } from "./MountainItem";
import { Bar, Card, Chip, ProgressRing, SectionTitle, Stat } from "./ui";
import { useStore } from "@/lib/store";
import { ShareButton } from "./ShareButton";

const HERO_LISTS = ["日本百名山", "日本二百名山", "日本三百名山", "花の百名山", "都道府県最高峰"] as const;

export function Dashboard() {
  const stats = useStats();
  const hydrated = useHydrated();
  const achievements = useAchievements(stats);
  const climbedMap = useClimbedMap();
  const wishSet = useWishSet();
  const ascentsMap = useStore((s) => s.ascents);

  const level = levelForXp(stats.cumulativeElevation);
  const { current: rank, next: nextRank } = rankFor(stats.totalClimbed);

  const nextGoals = useMemo(
    () =>
      achievements
        .filter((a) => !a.unlocked)
        .sort((a, b) => b.rate - a.rate || a.remaining - b.remaining)
        .slice(0, 4),
    [achievements],
  );

  const recommendations = useMemo(() => {
    const visited = new Set(stats.visitedPrefectures);
    const wishList = MOUNTAINS.filter((m) => wishSet.has(m.id) && !stats.climbedIds.has(m.id));
    if (wishList.length >= 3) return wishList.slice(0, 3);
    const pool = MOUNTAINS.filter((m) => !stats.climbedIds.has(m.id) && !wishSet.has(m.id));
    const scored = pool
      .map((m) => ({
        m,
        score:
          (m.prefectures.some((p) => visited.has(p)) || visited.size === 0 ? 3 : 0) +
          (m.lists.includes("日本百名山") ? 2 : 0) +
          (m.lists.length > 0 ? 1 : 0) +
          (6 - m.difficulty),
      }))
      .sort((a, b) => b.score - a.score || b.m.elevation - a.m.elevation);
    return [...wishList, ...scored.map((s) => s.m)].slice(0, 3);
  }, [stats.visitedPrefectures, stats.climbedIds, wishSet]);

  const recent = useMemo(
    () =>
      Object.values(ascentsMap)
        .filter((a) => !a.deleted && MOUNTAIN_BY_ID.has(a.mountainId))
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.createdAt.localeCompare(a.createdAt))
        .slice(0, 4),
    [ascentsMap],
  );

  const topPref = useMemo(() => {
    const entries = stats.visitedPrefectures
      .map((p) => ({ p, prog: stats.byPrefecture[p] }))
      .sort((a, b) => b.prog.climbed - a.prog.climbed);
    return entries[0] ?? null;
  }, [stats]);

  if (!hydrated) {
    return (
      <div className="card flex h-64 items-center justify-center text-sm text-ink-muted">
        読み込み中…
      </div>
    );
  }

  return (
    <div>
      <section className="card overflow-hidden p-0">
        <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-[var(--brand-soft)] to-transparent px-4 py-6 sm:flex-row sm:items-center sm:gap-6 sm:px-6">
          <ProgressRing rate={stats.overall.rate} size={168}>
            <span className="text-[11px] font-bold text-ink-subtle">コンプリート率</span>
            <span className="text-3xl font-black tabular-nums leading-none">
              {(stats.overall.rate * 100).toFixed(1)}
              <span className="text-base">%</span>
            </span>
            <span className="mt-1 text-xs font-black tabular-nums">
              {stats.totalClimbed} / {stats.totalMountains} 座
            </span>
          </ProgressRing>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-3 py-1 shadow-sm">
              <span className="text-lg" aria-hidden>{rank.emoji}</span>
              <span className="text-sm font-black">{rank.name}</span>
              <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[11px] font-black text-white">
                Lv.{level.level}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-muted">{rank.description}</p>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-ink-subtle">
                <span>次のレベルまで</span>
                <span className="tabular-nums">
                  あと {(level.nextLevelXp - level.currentLevelXp).toLocaleString()} m
                </span>
              </div>
              <Bar rate={level.progress} tone="accent" />
            </div>

            <div className="mt-3 flex justify-center sm:justify-start">
              <ShareButton />
            </div>

            {nextRank ? (
              <p className="mt-2 text-[11px] font-bold text-ink-muted">
                あと <span className="text-[var(--brand)]">{nextRank.min - stats.totalClimbed}</span> 座で
                「{nextRank.emoji} {nextRank.name}」
              </p>
            ) : (
              <p className="mt-2 text-[11px] font-bold text-[var(--accent)]">最高称号に到達しています！</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
          {[
            { label: "累積標高", value: `${stats.cumulativeElevation.toLocaleString()}m` },
            { label: "登頂回数", value: `${stats.totalAscents}回` },
            { label: "訪れた県", value: `${stats.visitedPrefectures.length}/47` },
            { label: "連続登山", value: `${stats.monthStreak}か月` },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] px-3 py-3 text-center">
              <p className="text-[11px] font-bold text-ink-subtle">{s.label}</p>
              <p className="text-base font-black tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <SectionTitle title="登った高さは、こんなに" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {elevationMetaphors(stats.cumulativeElevation).map((m) => (
          <Stat key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      <SectionTitle
        title="あと少しで解除できる実績"
        action={
          <Link href="/achievements" className="text-xs font-bold text-[var(--brand)]">
            すべて見る →
          </Link>
        }
      />
      <ul className="space-y-2">
        {nextGoals.map((a) => (
          <li key={a.id}>
            <Card>
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden>{a.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="truncate text-sm font-black">{a.name}</p>
                    <Chip tone="outline">{a.tier}</Chip>
                  </div>
                  <p className="truncate text-[11px] text-ink-muted">{a.description}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1"><Bar rate={a.rate} /></div>
                    <span className="shrink-0 text-[11px] font-black tabular-nums text-ink-muted">
                      {a.current.toLocaleString()}/{a.goal.toLocaleString()}{a.unit}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <SectionTitle title="名山リストの進み具合" hint="分母はこのアプリに収録している座数です" />
      <Card className="space-y-3">
        {HERO_LISTS.map((l) => {
          const p = stats.byList[l];
          return (
            <Link key={l} href={`/mountains?list=${encodeURIComponent(l)}`} className="block">
              <div className="mb-1 flex items-center justify-between text-xs font-bold">
                <span>{l}</span>
                <span className="tabular-nums text-ink-muted">
                  {p.climbed}/{p.total}（{Math.round(p.rate * 100)}%）
                </span>
              </div>
              <Bar rate={p.rate} />
            </Link>
          );
        })}
      </Card>

      <SectionTitle
        title="次はこの山はいかが？"
        hint={
          topPref
            ? `${topPref.p}をよく歩いていますね。近くの未登頂の山です`
            : "まずは登りやすい名山から始めましょう"
        }
      />
      <ul className="space-y-2">
        {recommendations.map((m) => (
          <MountainItem
            key={m.id}
            mountain={m}
            count={climbedMap.get(m.id) ?? 0}
            wished={wishSet.has(m.id)}
          />
        ))}
      </ul>

      <SectionTitle
        title="都道府県コンプリート"
        action={
          <Link href="/map" className="text-xs font-bold text-[var(--brand)]">
            地図を開く →
          </Link>
        }
      />
      <Card>
        <JapanTileMap byPrefecture={stats.byPrefecture} />
      </Card>

      <SectionTitle
        title="最近の記録"
        action={
          <Link href="/records" className="text-xs font-bold text-[var(--brand)]">
            すべて見る →
          </Link>
        }
      />
      {recent.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">
            まだ記録がありません。山リストから登った山にチェックを入れてみましょう。
          </p>
          <Link
            href="/mountains"
            className="mt-3 inline-block rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-black text-white"
          >
            山を探す
          </Link>
        </Card>
      ) : (
        <ul className="space-y-2">
          {recent.map((a) => {
            const m = MOUNTAIN_BY_ID.get(a.mountainId)!;
            return (
              <li key={a.id}>
                <Link href={`/mountains/${m.id}`} className="card flex items-center gap-3 p-3">
                  <span className="text-xl" aria-hidden>⛰️</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">{m.name}</p>
                    <p className="text-[11px] text-ink-subtle tabular-nums">
                      {a.date ?? "日付なし"} ・ {m.elevation.toLocaleString()}m
                    </p>
                  </div>
                  {a.rating ? <span className="text-xs">{"⭐".repeat(a.rating)}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
