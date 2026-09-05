import { MOUNTAINS, MOUNTAIN_BY_ID, TOTAL_MOUNTAINS } from "@/data/mountains";
import { PREFECTURES, REGIONS, LISTS, FEATURES } from "@/data/types";
import type { Feature, Mountain, MountainList, Prefecture, Region, Season } from "@/data/types";
import type { Ascent } from "./types";

export type Progress = { climbed: number; total: number; rate: number };

const emptyProgress = (total: number): Progress => ({ climbed: 0, total, rate: 0 });

function seasonOf(month: number): Season {
  if (month >= 3 && month <= 5) return "春";
  if (month >= 6 && month <= 8) return "夏";
  if (month >= 9 && month <= 11) return "秋";
  return "冬";
}

export type Stats = {
  ascents: Ascent[];
  climbedIds: Set<string>;
  climbedMountains: Mountain[];
  totalClimbed: number;
  totalMountains: number;
  totalAscents: number;
  overall: Progress;
  /** 登った回数ぶんの標高合計（経験値） */
  cumulativeElevation: number;
  /** 登った山（重複なし）の標高合計 */
  uniqueElevation: number;
  highestMountain: Mountain | null;
  byPrefecture: Record<Prefecture, Progress>;
  byRegion: Record<Region, Progress>;
  byList: Record<MountainList, Progress>;
  byFeature: Record<Feature, Progress>;
  completedPrefectures: Prefecture[];
  completedRegions: Region[];
  visitedPrefectures: Prefecture[];
  yearCounts: { year: number; count: number }[];
  monthKeys: Set<string>;
  seasons: Set<Season>;
  /** 直近から連続して登山した月数 */
  monthStreak: number;
  /** 同じ山を登った最大回数 */
  maxRepeat: number;
  /** 1日に複数座登った日の数 */
  multiPeakDays: number;
  ratedCount: number;
  notedCount: number;
  winterCount: number;
  over3000: number;
  over2500: number;
  under1000: number;
  noRopewayOver2000: number;
  tech5Count: number;
  phys5Count: number;
  firstAscentDate: string | null;
  latestAscentDate: string | null;
  activeDays: number;
};

const ALL_PREF_TOTALS: Record<string, number> = {};
const ALL_REGION_TOTALS: Record<string, number> = {};
const ALL_LIST_TOTALS: Record<string, number> = {};
const ALL_FEATURE_TOTALS: Record<string, number> = {};
for (const m of MOUNTAINS) {
  for (const p of m.prefectures) ALL_PREF_TOTALS[p] = (ALL_PREF_TOTALS[p] ?? 0) + 1;
  for (const r of m.regions) ALL_REGION_TOTALS[r] = (ALL_REGION_TOTALS[r] ?? 0) + 1;
  for (const l of m.lists) ALL_LIST_TOTALS[l] = (ALL_LIST_TOTALS[l] ?? 0) + 1;
  for (const f of m.features) ALL_FEATURE_TOTALS[f] = (ALL_FEATURE_TOTALS[f] ?? 0) + 1;
}

export const PREF_TOTALS = ALL_PREF_TOTALS as Record<Prefecture, number>;
export const REGION_TOTALS = ALL_REGION_TOTALS as Record<Region, number>;
export const LIST_TOTALS = ALL_LIST_TOTALS as Record<MountainList, number>;
export const FEATURE_TOTALS = ALL_FEATURE_TOTALS as Record<Feature, number>;

function buildProgressMap<K extends string>(keys: readonly K[], totals: Record<string, number>) {
  const out = {} as Record<K, Progress>;
  for (const k of keys) out[k] = emptyProgress(totals[k] ?? 0);
  return out;
}

export function computeStats(allAscents: Ascent[]): Stats {
  const ascents = allAscents
    .filter((a) => !a.deleted && MOUNTAIN_BY_ID.has(a.mountainId))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.createdAt.localeCompare(a.createdAt));

  const climbedIds = new Set(ascents.map((a) => a.mountainId));
  const climbedMountains = [...climbedIds]
    .map((id) => MOUNTAIN_BY_ID.get(id)!)
    .sort((a, b) => b.elevation - a.elevation);

  const byPrefecture = buildProgressMap(PREFECTURES, ALL_PREF_TOTALS);
  const byRegion = buildProgressMap(REGIONS, ALL_REGION_TOTALS);
  const byList = buildProgressMap(LISTS, ALL_LIST_TOTALS);
  const byFeature = buildProgressMap(FEATURES, ALL_FEATURE_TOTALS);

  let uniqueElevation = 0;
  let over3000 = 0;
  let over2500 = 0;
  let under1000 = 0;
  let noRopewayOver2000 = 0;
  let tech5Count = 0;
  let phys5Count = 0;

  for (const m of climbedMountains) {
    uniqueElevation += m.elevation;
    if (m.elevation >= 3000) over3000 += 1;
    if (m.elevation >= 2500) over2500 += 1;
    if (m.elevation < 1000) under1000 += 1;
    if (!m.ropeway && m.elevation >= 2000) noRopewayOver2000 += 1;
    if (m.technical >= 5) tech5Count += 1;
    if (m.physical >= 5) phys5Count += 1;
    for (const p of m.prefectures) byPrefecture[p].climbed += 1;
    for (const r of m.regions) byRegion[r].climbed += 1;
    for (const l of m.lists) byList[l].climbed += 1;
    for (const f of m.features) byFeature[f].climbed += 1;
  }

  for (const map of [byPrefecture, byRegion, byList, byFeature]) {
    for (const key of Object.keys(map)) {
      const p = (map as Record<string, Progress>)[key];
      p.rate = p.total === 0 ? 0 : p.climbed / p.total;
    }
  }

  let cumulativeElevation = 0;
  const yearMap = new Map<number, number>();
  const monthKeys = new Set<string>();
  const dayCount = new Map<string, number>();
  const seasons = new Set<Season>();
  const repeats = new Map<string, number>();
  let ratedCount = 0;
  let notedCount = 0;
  let winterCount = 0;

  for (const a of ascents) {
    const m = MOUNTAIN_BY_ID.get(a.mountainId)!;
    cumulativeElevation += m.elevation;
    repeats.set(a.mountainId, (repeats.get(a.mountainId) ?? 0) + 1);
    if (a.rating && a.rating >= 5) ratedCount += 1;
    if (a.note && a.note.trim().length > 0) notedCount += 1;
    if (a.date) {
      const [y, mo] = a.date.split("-").map(Number);
      yearMap.set(y, (yearMap.get(y) ?? 0) + 1);
      monthKeys.add(a.date.slice(0, 7));
      dayCount.set(a.date, (dayCount.get(a.date) ?? 0) + 1);
      seasons.add(seasonOf(mo));
      if (mo === 12 || mo === 1 || mo === 2) winterCount += 1;
    }
  }

  // 直近の登山月から遡って連続している月数
  let monthStreak = 0;
  if (monthKeys.size > 0) {
    const sorted = [...monthKeys].sort().reverse();
    const cursor = new Date(`${sorted[0]}-01T00:00:00`);
    while (monthKeys.has(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`)) {
      monthStreak += 1;
      cursor.setMonth(cursor.getMonth() - 1);
    }
  }

  const dated = ascents.filter((a) => a.date).map((a) => a.date!);
  const completedPrefectures = PREFECTURES.filter(
    (p) => byPrefecture[p].total > 0 && byPrefecture[p].climbed === byPrefecture[p].total,
  );
  const completedRegions = REGIONS.filter(
    (r) => byRegion[r].total > 0 && byRegion[r].climbed === byRegion[r].total,
  );

  return {
    ascents,
    climbedIds,
    climbedMountains,
    totalClimbed: climbedIds.size,
    totalMountains: TOTAL_MOUNTAINS,
    totalAscents: ascents.length,
    overall: {
      climbed: climbedIds.size,
      total: TOTAL_MOUNTAINS,
      rate: climbedIds.size / TOTAL_MOUNTAINS,
    },
    cumulativeElevation,
    uniqueElevation,
    highestMountain: climbedMountains[0] ?? null,
    byPrefecture,
    byRegion,
    byList,
    byFeature,
    completedPrefectures,
    completedRegions,
    visitedPrefectures: PREFECTURES.filter((p) => byPrefecture[p].climbed > 0),
    yearCounts: [...yearMap.entries()]
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year),
    monthKeys,
    seasons,
    monthStreak,
    maxRepeat: repeats.size === 0 ? 0 : Math.max(...repeats.values()),
    multiPeakDays: [...dayCount.values()].filter((c) => c >= 2).length,
    ratedCount,
    notedCount,
    winterCount,
    over3000,
    over2500,
    under1000,
    noRopewayOver2000,
    tech5Count,
    phys5Count,
    firstAscentDate: dated.length ? dated[dated.length - 1] : null,
    latestAscentDate: dated.length ? dated[0] : null,
    activeDays: dayCount.size,
  };
}

export const EMPTY_STATS = computeStats([]);
