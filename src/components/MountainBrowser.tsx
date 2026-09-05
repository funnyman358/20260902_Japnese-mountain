"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MOUNTAINS } from "@/data/mountains";
import {
  DURATIONS,
  FEATURES,
  LISTS,
  PREFECTURES,
  REGIONS,
  SEASONS,
  type Duration,
  type Feature,
  type Mountain,
  type MountainList,
  type Prefecture,
  type Region,
  type Season,
} from "@/data/types";
import { PREF_SHORT } from "@/data/prefectures";
import { useClimbedMap, useWishSet } from "@/lib/hooks";
import { MountainItem } from "./MountainItem";
import { Bar, Chip } from "./ui";

const ELEVATION_BANDS = [
  { key: "0", label: "〜1000m", min: 0, max: 999 },
  { key: "1", label: "1000〜1500m", min: 1000, max: 1499 },
  { key: "2", label: "1500〜2000m", min: 1500, max: 1999 },
  { key: "3", label: "2000〜2500m", min: 2000, max: 2499 },
  { key: "4", label: "2500〜3000m", min: 2500, max: 2999 },
  { key: "5", label: "3000m以上", min: 3000, max: 9999 },
] as const;

type ClimbFilter = "all" | "climbed" | "unclimbed" | "wish";
type SortKey = "elevation-desc" | "elevation-asc" | "kana" | "difficulty-asc" | "difficulty-desc" | "pref";

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[var(--line)] pt-3">
      <p className="mb-1.5 text-[11px] font-black text-ink-subtle">{title}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
        active ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-2)] text-ink-muted hover:bg-[var(--surface-3)]"
      }`}
    >
      {children}
    </button>
  );
}

export function MountainBrowser() {
  const params = useSearchParams();
  const climbedMap = useClimbedMap();
  const wishSet = useWishSet();

  const [q, setQ] = useState(params.get("q") ?? "");
  const [climbFilter, setClimbFilter] = useState<ClimbFilter>(
    (params.get("status") as ClimbFilter) || "all",
  );
  const [regions, setRegions] = useState<Region[]>(
    params.get("region") ? [params.get("region") as Region] : [],
  );
  const [prefs, setPrefs] = useState<Prefecture[]>(
    params.get("pref") ? [params.get("pref") as Prefecture] : [],
  );
  const [lists, setLists] = useState<MountainList[]>(
    params.get("list") ? [params.get("list") as MountainList] : [],
  );
  const [features, setFeatures] = useState<Feature[]>(
    params.get("feature") ? [params.get("feature") as Feature] : [],
  );
  const [bands, setBands] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);
  const [maxPhysical, setMaxPhysical] = useState(5);
  const [maxTechnical, setMaxTechnical] = useState(5);
  const [ropewayOnly, setRopewayOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("elevation-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(60);

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    const result = MOUNTAINS.filter((m) => {
      if (keyword) {
        const hay = [
          m.name,
          m.kana,
          m.range,
          ...m.prefectures,
          ...m.municipalities,
          ...m.features,
          ...m.lists,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(keyword)) return false;
      }
      const count = climbedMap.get(m.id) ?? 0;
      if (climbFilter === "climbed" && count === 0) return false;
      if (climbFilter === "unclimbed" && count > 0) return false;
      if (climbFilter === "wish" && !wishSet.has(m.id)) return false;
      if (regions.length && !m.regions.some((r) => regions.includes(r))) return false;
      if (prefs.length && !m.prefectures.some((p) => prefs.includes(p))) return false;
      if (lists.length && !m.lists.some((l) => lists.includes(l))) return false;
      if (features.length && !features.every((f) => m.features.includes(f))) return false;
      if (bands.length) {
        const hit = bands.some((k) => {
          const b = ELEVATION_BANDS.find((x) => x.key === k)!;
          return m.elevation >= b.min && m.elevation <= b.max;
        });
        if (!hit) return false;
      }
      if (seasons.length && !m.seasons.some((s) => seasons.includes(s))) return false;
      if (durations.length && !durations.includes(m.duration)) return false;
      if (m.physical > maxPhysical) return false;
      if (m.technical > maxTechnical) return false;
      if (ropewayOnly && !m.ropeway) return false;
      return true;
    });

    const sorters: Record<SortKey, (a: Mountain, b: Mountain) => number> = {
      "elevation-desc": (a, b) => b.elevation - a.elevation,
      "elevation-asc": (a, b) => a.elevation - b.elevation,
      kana: (a, b) => a.kana.localeCompare(b.kana, "ja"),
      "difficulty-asc": (a, b) => a.difficulty - b.difficulty || a.elevation - b.elevation,
      "difficulty-desc": (a, b) => b.difficulty - a.difficulty || b.elevation - a.elevation,
      pref: (a, b) =>
        PREFECTURES.indexOf(a.prefectures[0]) - PREFECTURES.indexOf(b.prefectures[0]) ||
        b.elevation - a.elevation,
    };
    return [...result].sort(sorters[sort]);
  }, [q, climbFilter, regions, prefs, lists, features, bands, seasons, durations, maxPhysical, maxTechnical, ropewayOnly, sort, climbedMap, wishSet]);

  const climbedInView = filtered.filter((m) => (climbedMap.get(m.id) ?? 0) > 0).length;
  const activeFilterCount =
    regions.length + prefs.length + lists.length + features.length + bands.length +
    seasons.length + durations.length + (ropewayOnly ? 1 : 0) +
    (maxPhysical < 5 ? 1 : 0) + (maxTechnical < 5 ? 1 : 0);

  const resetAll = () => {
    setRegions([]); setPrefs([]); setLists([]); setFeatures([]); setBands([]);
    setSeasons([]); setDurations([]); setMaxPhysical(5); setMaxTechnical(5);
    setRopewayOnly(false); setQ(""); setClimbFilter("all");
  };

  return (
    <div>
      <div className="sticky top-[57px] z-30 -mx-4 mb-3 bg-[var(--page)]/95 px-4 pb-2 pt-1 backdrop-blur">
        <div className="flex gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setLimit(60); }}
            placeholder="山名・よみ・都道府県・市町村で検索"
            className="min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`relative shrink-0 rounded-xl border px-3 py-2 text-sm font-bold transition ${
              showFilters || activeFilterCount
                ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                : "border-[var(--line)] bg-[var(--surface)] text-ink-muted"
            }`}
          >
            絞込
            {activeFilterCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-black text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
          {([
            ["all", "すべて"],
            ["unclimbed", "未登頂"],
            ["climbed", "登頂済"],
            ["wish", "行きたい🚩"],
          ] as [ClimbFilter, string][]).map(([key, label]) => (
            <Toggle key={key} active={climbFilter === key} onClick={() => { setClimbFilter(key); setLimit(60); }}>
              {label}
            </Toggle>
          ))}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="ml-auto shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-xs font-bold text-ink-muted"
          >
            <option value="elevation-desc">標高が高い順</option>
            <option value="elevation-asc">標高が低い順</option>
            <option value="kana">五十音順</option>
            <option value="difficulty-asc">やさしい順</option>
            <option value="difficulty-desc">手ごわい順</option>
            <option value="pref">都道府県順</option>
          </select>
        </div>
      </div>

      {showFilters ? (
        <div className="card animate-rise mb-3 space-y-3 p-4">
          <FilterGroup title="地方">
            {REGIONS.map((r) => (
              <Toggle key={r} active={regions.includes(r)} onClick={() => { setRegions(toggle(regions, r)); setLimit(60); }}>
                {r}
              </Toggle>
            ))}
          </FilterGroup>

          <FilterGroup title="都道府県">
            {PREFECTURES.map((p) => (
              <Toggle key={p} active={prefs.includes(p)} onClick={() => { setPrefs(toggle(prefs, p)); setLimit(60); }}>
                {PREF_SHORT[p]}
              </Toggle>
            ))}
          </FilterGroup>

          <FilterGroup title="名山リスト">
            {LISTS.map((l) => (
              <Toggle key={l} active={lists.includes(l)} onClick={() => { setLists(toggle(lists, l)); setLimit(60); }}>
                {l}
              </Toggle>
            ))}
          </FilterGroup>

          <FilterGroup title="山の種類・特徴（すべて含む）">
            {FEATURES.map((f) => (
              <Toggle key={f} active={features.includes(f)} onClick={() => { setFeatures(toggle(features, f)); setLimit(60); }}>
                {f}
              </Toggle>
            ))}
          </FilterGroup>

          <FilterGroup title="標高帯">
            {ELEVATION_BANDS.map((b) => (
              <Toggle key={b.key} active={bands.includes(b.key)} onClick={() => { setBands(toggle(bands, b.key)); setLimit(60); }}>
                {b.label}
              </Toggle>
            ))}
          </FilterGroup>

          <FilterGroup title="適期">
            {SEASONS.map((s) => (
              <Toggle key={s} active={seasons.includes(s)} onClick={() => { setSeasons(toggle(seasons, s)); setLimit(60); }}>
                {s}
              </Toggle>
            ))}
          </FilterGroup>

          <FilterGroup title="行程">
            {DURATIONS.map((d) => (
              <Toggle key={d} active={durations.includes(d)} onClick={() => { setDurations(toggle(durations, d)); setLimit(60); }}>
                {d}
              </Toggle>
            ))}
            <Toggle active={ropewayOnly} onClick={() => setRopewayOnly(!ropewayOnly)}>
              ロープウェイ等あり
            </Toggle>
          </FilterGroup>

          <div className="border-t border-[var(--line)] pt-3">
            <label className="block text-[11px] font-black text-ink-subtle">
              体力度 {maxPhysical} 以下
              <input
                type="range" min={1} max={5} value={maxPhysical}
                onChange={(e) => setMaxPhysical(Number(e.target.value))}
                className="mt-1 w-full accent-[var(--brand)]"
              />
            </label>
            <label className="mt-2 block text-[11px] font-black text-ink-subtle">
              技術度 {maxTechnical} 以下
              <input
                type="range" min={1} max={5} value={maxTechnical}
                onChange={(e) => setMaxTechnical(Number(e.target.value))}
                className="mt-1 w-full accent-[var(--brand)]"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="w-full rounded-xl border border-[var(--line)] py-2 text-xs font-bold text-ink-muted"
          >
            絞り込みをすべて解除
          </button>
        </div>
      ) : null}

      <div className="card mb-3 flex items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-ink-muted">
            該当 <span className="text-base font-black text-ink tabular-nums">{filtered.length}</span> 座 ／ 登頂{" "}
            <span className="text-base font-black text-[var(--brand)] tabular-nums">{climbedInView}</span> 座
          </p>
          <div className="mt-1.5">
            <Bar rate={filtered.length ? climbedInView / filtered.length : 0} />
          </div>
        </div>
        <Chip tone="brand">
          {filtered.length ? Math.round((climbedInView / filtered.length) * 100) : 0}%
        </Chip>
      </div>

      {filtered.length === 0 ? (
        <div className="card px-6 py-10 text-center text-sm text-ink-muted">
          条件に合う山が見つかりませんでした。
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {filtered.slice(0, limit).map((m) => (
              <MountainItem
                key={m.id}
                mountain={m}
                count={climbedMap.get(m.id) ?? 0}
                wished={wishSet.has(m.id)}
              />
            ))}
          </ul>
          {filtered.length > limit ? (
            <button
              type="button"
              onClick={() => setLimit((l) => l + 100)}
              className="mt-4 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] py-3 text-sm font-bold text-ink-muted"
            >
              さらに表示（残り {filtered.length - limit} 座）
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
