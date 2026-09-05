"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Mountain } from "@/data/types";
import { MOUNTAINS } from "@/data/mountains";
import { useStore } from "@/lib/store";
import { useClimbedMap, useWishSet } from "@/lib/hooks";
import { ClimbToggle, WishToggle } from "./MountainItem";
import { RecordSheet } from "./RecordSheet";
import { Card, Chip, DifficultyDots, SectionTitle } from "./ui";
import type { Ascent } from "@/lib/types";

export function MountainDetail({ mountain }: { mountain: Mountain }) {
  const climbedMap = useClimbedMap();
  const wishSet = useWishSet();
  const ascents = useStore((s) => s.ascents);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Ascent | undefined>(undefined);

  const records = useMemo(
    () =>
      Object.values(ascents)
        .filter((a) => !a.deleted && a.mountainId === mountain.id)
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")),
    [ascents, mountain.id],
  );

  const related = useMemo(() => {
    const samePref = MOUNTAINS.filter(
      (m) => m.id !== mountain.id && m.prefectures.some((p) => mountain.prefectures.includes(p)),
    );
    const scored = samePref
      .map((m) => ({
        m,
        score:
          (m.range && m.range === mountain.range ? 10 : 0) +
          m.features.filter((f) => mountain.features.includes(f)).length +
          (Math.abs(m.elevation - mountain.elevation) < 500 ? 1 : 0),
      }))
      .sort((a, b) => b.score - a.score || b.m.elevation - a.m.elevation);
    return scored.slice(0, 6).map((s) => s.m);
  }, [mountain]);

  const count = climbedMap.get(mountain.id) ?? 0;

  return (
    <div>
      <Link href="/mountains" className="text-xs font-bold text-ink-subtle">
        ← 山リストへ
      </Link>

      <div className="card mt-2 p-4">
        <div className="flex items-start gap-3">
          <ClimbToggle mountain={mountain} count={count} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black leading-tight">{mountain.name}</h1>
            <p className="text-xs text-ink-subtle">{mountain.kana}</p>
            <p className="mt-1 text-sm font-black text-[var(--brand-strong)] tabular-nums">
              標高 {mountain.elevation.toLocaleString()} m
            </p>
          </div>
          <WishToggle mountainId={mountain.id} active={wishSet.has(mountain.id)} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{mountain.summary}</p>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="font-bold text-ink-subtle">都道府県</dt>
            <dd className="font-bold">
              {mountain.prefectures.map((p, i) => (
                <span key={p}>
                  {i > 0 ? "・" : ""}
                  <Link href={`/mountains?pref=${encodeURIComponent(p)}`} className="underline decoration-dotted">
                    {p}
                  </Link>
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="font-bold text-ink-subtle">市町村</dt>
            <dd className="font-bold">{mountain.municipalities.join("・")}</dd>
          </div>
          {mountain.range ? (
            <div>
              <dt className="font-bold text-ink-subtle">山域</dt>
              <dd className="font-bold">{mountain.range}</dd>
            </div>
          ) : null}
          <div>
            <dt className="font-bold text-ink-subtle">地方</dt>
            <dd className="font-bold">{mountain.regions.join("・")}</dd>
          </div>
          <div>
            <dt className="font-bold text-ink-subtle">適期</dt>
            <dd className="font-bold">{mountain.seasons.join("・")}</dd>
          </div>
          <div>
            <dt className="font-bold text-ink-subtle">標準的な行程</dt>
            <dd className="font-bold">
              {mountain.duration}
              {mountain.ropeway ? "（ロープウェイ等あり）" : ""}
            </dd>
          </div>
        </dl>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <DifficultyDots value={mountain.physical} label="体力度" />
          <DifficultyDots value={mountain.technical} label="技術度" />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {mountain.lists.map((l) => (
            <Link key={l} href={`/mountains?list=${encodeURIComponent(l)}`}>
              <Chip tone="accent">{l}</Chip>
            </Link>
          ))}
          {mountain.features.map((f) => (
            <Link key={f} href={`/mountains?feature=${encodeURIComponent(f)}`}>
              <Chip>{f}</Chip>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setSheetOpen(true);
          }}
          className="mt-4 w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-black text-white transition active:scale-[0.99]"
        >
          {count > 0 ? "この山の記録を追加する" : "登頂を記録する（日付・メモつき）"}
        </button>
      </div>

      <SectionTitle title={`登頂記録（${records.length}件）`} />
      {records.length === 0 ? (
        <Card>
          <p className="text-sm text-ink-muted">
            まだ記録がありません。登頂したら日付や思い出を残しておきましょう。
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {records.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  setEditing(r);
                  setSheetOpen(true);
                }}
                className="card w-full p-3 text-left transition hover:border-[var(--brand)]/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tabular-nums">{r.date ?? "日付なし"}</span>
                  {r.weather ? <Chip>{r.weather}</Chip> : null}
                  {r.rating ? <span className="text-xs">{"⭐".repeat(r.rating)}</span> : null}
                  <span className="ml-auto text-[11px] text-ink-subtle">編集</span>
                </div>
                {r.companions ? (
                  <p className="mt-1 text-xs text-ink-muted">同行： {r.companions}</p>
                ) : null}
                {r.note ? <p className="mt-1 whitespace-pre-wrap text-xs text-ink-muted">{r.note}</p> : null}
              </button>
            </li>
          ))}
        </ul>
      )}

      <SectionTitle title="近くの山・似た山" hint="同じ都道府県から、雰囲気の近い山を選びました" />
      <ul className="grid grid-cols-2 gap-2">
        {related.map((m) => (
          <li key={m.id}>
            <Link href={`/mountains/${m.id}`} className="card block p-3 transition hover:border-[var(--brand)]/50">
              <p className="truncate text-sm font-black">{m.name}</p>
              <p className="text-[11px] text-ink-subtle tabular-nums">
                {m.elevation.toLocaleString()}m
                {(climbedMap.get(m.id) ?? 0) > 0 ? " ・登頂済" : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <RecordSheet
        mountain={mountain}
        ascent={editing}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
