"use client";

import { useState } from "react";
import { ACHIEVEMENT_CATEGORIES, TIER_STYLE, type AchievementCategory } from "@/data/achievements";
import { useAchievements, useHydrated, useStats } from "@/lib/hooks";
import { Bar, Card, Chip, ProgressRing, SectionTitle } from "./ui";

export function AchievementsView() {
  const stats = useStats();
  const hydrated = useHydrated();
  const achievements = useAchievements(stats);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [category, setCategory] = useState<AchievementCategory | "all">("all");

  if (!hydrated) {
    return <div className="card flex h-64 items-center justify-center text-sm text-ink-muted">読み込み中…</div>;
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const shown = achievements.filter((a) => {
    if (filter === "unlocked" && !a.unlocked) return false;
    if (filter === "locked" && a.unlocked) return false;
    if (category !== "all" && a.category !== category) return false;
    return true;
  });

  return (
    <div>
      <h1 className="mb-3 text-lg font-black">実績</h1>

      <Card className="flex items-center gap-4">
        <ProgressRing rate={unlockedCount / achievements.length} size={104} stroke={11}>
          <span className="text-lg font-black tabular-nums leading-none">
            {unlockedCount}
          </span>
          <span className="text-[10px] font-bold text-ink-subtle">/ {achievements.length}</span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black">
            {unlockedCount} 個の実績を解除しています
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">
            登る・記録する・エリアを広げる。行動のすべてがバッジになります。
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {(["ブロンズ", "シルバー", "ゴールド", "プラチナ"] as const).map((t) => {
              const n = achievements.filter((a) => a.tier === t && a.unlocked).length;
              const total = achievements.filter((a) => a.tier === t).length;
              return (
                <span key={t} className={`rounded-full px-2 py-0.5 text-[11px] font-black ${TIER_STYLE[t].chip}`}>
                  {t} {n}/{total}
                </span>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {([["all", "すべて"], ["locked", "未解除"], ["unlocked", "解除済"]] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setFilter(k)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              filter === k ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-2)] text-ink-muted"
            }`}
          >
            {label}
          </button>
        ))}
        <span className="w-full" />
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            category === "all" ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-ink-muted"
          }`}
        >
          全カテゴリ
        </button>
        {ACHIEVEMENT_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              category === c ? "bg-[var(--ink)] text-[var(--surface)]" : "bg-[var(--surface-2)] text-ink-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {ACHIEVEMENT_CATEGORIES.filter((c) => category === "all" || c === category).map((c) => {
        const items = shown.filter((a) => a.category === c);
        if (items.length === 0) return null;
        return (
          <div key={c}>
            <SectionTitle
              title={c}
              action={
                <Chip tone="outline">
                  {items.filter((a) => a.unlocked).length}/{items.length}
                </Chip>
              }
            />
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((a) => (
                <li key={a.id}>
                  <div
                    className={`card h-full p-3 ring-1 transition ${
                      a.unlocked ? `${TIER_STYLE[a.tier].ring} bg-[var(--brand-soft)]/30` : "ring-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-2xl ${a.unlocked ? "" : "opacity-30 grayscale"}`} aria-hidden>
                        {a.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-black">{a.name}</p>
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-black ${TIER_STYLE[a.tier].chip}`}>
                            {a.tier}
                          </span>
                          {a.unlocked ? <span className="ml-auto text-xs">✅</span> : null}
                        </div>
                        <p className="text-[11px] text-ink-muted">{a.description}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1">
                            <Bar rate={a.rate} tone={a.unlocked ? "accent" : "brand"} />
                          </div>
                          <span className="shrink-0 text-[11px] font-black tabular-nums text-ink-muted">
                            {a.current.toLocaleString()}/{a.goal.toLocaleString()}
                          </span>
                        </div>
                        {!a.unlocked ? (
                          <p className="mt-1 text-[11px] font-bold text-[var(--accent)]">
                            あと {a.remaining.toLocaleString()} {a.unit}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
