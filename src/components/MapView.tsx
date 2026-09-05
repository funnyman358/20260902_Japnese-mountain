"use client";

import Link from "next/link";
import { REGIONS, PREFECTURES, type Region } from "@/data/types";
import { PREF_REGION } from "@/data/prefectures";
import { useHydrated, useStats } from "@/lib/hooks";
import { JapanTileMap } from "./JapanTileMap";
import { Bar, Card, Chip, SectionTitle } from "./ui";

export function MapView() {
  const stats = useStats();
  const hydrated = useHydrated();

  if (!hydrated) {
    return <div className="card flex h-64 items-center justify-center text-sm text-ink-muted">読み込み中…</div>;
  }

  const byRegion = (r: Region) => PREFECTURES.filter((p) => PREF_REGION[p] === r);

  return (
    <div>
      <h1 className="mb-1 text-lg font-black">日本地図でコンプリート</h1>
      <p className="mb-3 text-xs text-ink-muted">
        色が濃いほど登頂率が高く、オレンジはその県の収録全山を制覇した証です。タップで絞り込み表示へ。
        県境にまたがる山は、関係するすべての県で数えています。
      </p>

      <Card>
        <JapanTileMap byPrefecture={stats.byPrefecture} />
      </Card>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="card px-3 py-3 text-center">
          <p className="text-[11px] font-bold text-ink-subtle">訪れた県</p>
          <p className="text-xl font-black tabular-nums">{stats.visitedPrefectures.length}/47</p>
        </div>
        <div className="card px-3 py-3 text-center">
          <p className="text-[11px] font-bold text-ink-subtle">制覇した県</p>
          <p className="text-xl font-black tabular-nums text-[var(--accent)]">
            {stats.completedPrefectures.length}
          </p>
        </div>
        <div className="card px-3 py-3 text-center">
          <p className="text-[11px] font-bold text-ink-subtle">制覇した地方</p>
          <p className="text-xl font-black tabular-nums text-[var(--accent)]">
            {stats.completedRegions.length}/10
          </p>
        </div>
      </div>

      {REGIONS.map((r) => {
        const prog = stats.byRegion[r];
        return (
          <div key={r}>
            <SectionTitle
              title={r}
              action={
                <Chip tone={prog.rate >= 1 ? "accent" : "brand"}>
                  {prog.climbed}/{prog.total}（{Math.round(prog.rate * 100)}%）
                </Chip>
              }
            />
            <Card className="space-y-2.5">
              {byRegion(r).map((p) => {
                const pp = stats.byPrefecture[p];
                return (
                  <Link key={p} href={`/mountains?pref=${encodeURIComponent(p)}`} className="block">
                    <div className="mb-1 flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1">
                        {p}
                        {pp.rate >= 1 ? <span aria-hidden>🏆</span> : null}
                      </span>
                      <span className="tabular-nums text-ink-muted">
                        {pp.climbed}/{pp.total}
                      </span>
                    </div>
                    <Bar rate={pp.rate} tone={pp.rate >= 1 ? "accent" : "brand"} />
                  </Link>
                );
              })}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
