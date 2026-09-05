"use client";

import Link from "next/link";
import { PREFECTURES, type Prefecture } from "@/data/types";
import { PREF_SHORT, PREF_TILE, TILE_COLS, TILE_ROWS } from "@/data/prefectures";
import type { Progress } from "@/lib/stats";

function tileStyle(rate: number, climbed: number) {
  if (climbed === 0) return { background: "var(--surface-3)", color: "var(--ink-subtle)" };
  if (rate >= 1) return { background: "var(--accent)", color: "#fff" };
  const alpha = 0.25 + rate * 0.7;
  return {
    background: `color-mix(in srgb, var(--brand) ${Math.round(alpha * 100)}%, var(--surface-3))`,
    color: rate > 0.45 ? "#fff" : "var(--ink)",
  };
}

export function JapanTileMap({
  byPrefecture,
  selected,
  hrefFor = (p) => `/mountains?pref=${encodeURIComponent(p)}`,
}: {
  byPrefecture: Record<Prefecture, Progress>;
  selected?: Prefecture | null;
  hrefFor?: (p: Prefecture) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <div
        className="mx-auto grid min-w-[340px] max-w-2xl gap-1"
        style={{
          gridTemplateColumns: `repeat(${TILE_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${TILE_ROWS}, minmax(0, 1fr))`,
          aspectRatio: `${TILE_COLS} / ${TILE_ROWS}`,
        }}
      >
        {PREFECTURES.map((p) => {
          const pos = PREF_TILE[p];
          const prog = byPrefecture[p];
          const style = tileStyle(prog.rate, prog.climbed);
          return (
            <Link
              key={p}
              href={hrefFor(p)}
              title={`${p} ${prog.climbed}/${prog.total}座 (${Math.round(prog.rate * 100)}%)`}
              className={`flex flex-col items-center justify-center rounded-[4px] text-center leading-none transition hover:scale-105 ${
                selected === p ? "ring-2 ring-[var(--ink)]" : ""
              }`}
              style={{ gridColumn: pos.col, gridRow: pos.row, ...style }}
            >
              <span className="text-[9px] font-black sm:text-[11px]">{PREF_SHORT[p]}</span>
              <span className="text-[8px] font-bold tabular-nums opacity-80 sm:text-[10px]">
                {prog.climbed}/{prog.total}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-bold text-ink-subtle">
        <span>未登頂</span>
        <span className="h-2 w-6 rounded-full" style={{ background: "var(--surface-3)" }} />
        <span className="h-2 w-6 rounded-full" style={{ background: "color-mix(in srgb, var(--brand) 45%, var(--surface-3))" }} />
        <span className="h-2 w-6 rounded-full" style={{ background: "var(--brand)" }} />
        <span className="h-2 w-6 rounded-full" style={{ background: "var(--accent)" }} />
        <span>コンプリート</span>
      </div>
    </div>
  );
}
