"use client";

import Link from "next/link";
import { useState } from "react";
import type { Mountain } from "@/data/types";
import { useStore } from "@/lib/store";
import { useToast } from "./Toast";
import { Chip } from "./ui";
import { RecordSheet } from "./RecordSheet";

export function ClimbToggle({
  mountain,
  count,
  compact = false,
}: {
  mountain: Mountain;
  count: number;
  compact?: boolean;
}) {
  const toggleClimbed = useStore((s) => s.toggleClimbed);
  const toast = useToast();
  const climbed = count > 0;

  return (
    <button
      type="button"
      aria-label={climbed ? "登頂を取り消す" : "登頂を記録する"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowClimbed = toggleClimbed(mountain.id);
        if (nowClimbed) {
          toast.push({
            emoji: "🎉",
            title: `${mountain.name} に登頂！`,
            body: `標高 ${mountain.elevation.toLocaleString()}m ・ ${mountain.prefectures.join("・")}`,
            tone: "celebrate",
          });
        } else {
          toast.push({ emoji: "↩️", title: `${mountain.name} の記録を取り消しました` });
        }
      }}
      className={`relative flex shrink-0 items-center justify-center rounded-full border-2 font-black transition active:scale-90 ${
        compact ? "h-9 w-9 text-sm" : "h-11 w-11 text-base"
      } ${
        climbed
          ? "border-[var(--brand)] bg-[var(--brand)] text-white"
          : "border-[var(--line)] bg-[var(--surface)] text-ink-subtle hover:border-[var(--brand)]"
      }`}
    >
      {climbed ? "✓" : "＋"}
      {count > 1 ? (
        <span className="absolute -right-1 -top-1 rounded-full bg-[var(--accent)] px-1 text-[10px] font-black text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function WishToggle({ mountainId, active }: { mountainId: string; active: boolean }) {
  const toggleWish = useStore((s) => s.toggleWish);
  return (
    <button
      type="button"
      aria-label={active ? "行きたいリストから外す" : "行きたいリストに追加"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWish(mountainId);
      }}
      className={`shrink-0 rounded-full px-2 py-1 text-base transition active:scale-90 ${
        active ? "" : "opacity-30 grayscale"
      }`}
    >
      🚩
    </button>
  );
}

export function MountainItem({
  mountain,
  count,
  wished,
}: {
  mountain: Mountain;
  count: number;
  wished: boolean;
}) {
  const climbed = count > 0;
  return (
    <li className="animate-rise">
      <div
        className={`card flex items-center gap-3 p-3 transition ${
          climbed ? "border-[var(--brand)]/40 bg-[var(--brand-soft)]/40" : ""
        }`}
      >
        <ClimbToggle mountain={mountain} count={count} />
        <Link href={`/mountains/${mountain.id}`} className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-[15px] font-black">{mountain.name}</h3>
            <span className="shrink-0 text-xs font-bold tabular-nums text-[var(--brand-strong)]">
              {mountain.elevation.toLocaleString()}m
            </span>
          </div>
          <p className="truncate text-[11px] text-ink-subtle">
            {mountain.kana}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-ink-muted">
            {mountain.prefectures.join("・")} / {mountain.municipalities.slice(0, 2).join("・")}
            {mountain.municipalities.length > 2 ? " ほか" : ""}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {mountain.lists.slice(0, 2).map((l) => (
              <Chip key={l} tone="accent">{l}</Chip>
            ))}
            {mountain.features.slice(0, 2).map((f) => (
              <Chip key={f}>{f}</Chip>
            ))}
          </div>
        </Link>
        <WishToggle mountainId={mountain.id} active={wished} />
      </div>
    </li>
  );
}

export function QuickRecordButton({ mountain, label = "記録を書く" }: { mountain: Mountain; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-ink transition hover:border-[var(--brand)]"
      >
        {label}
      </button>
      <RecordSheet mountain={mountain} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
