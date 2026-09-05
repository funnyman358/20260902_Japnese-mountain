import type { Mountain, Prefecture, RawMountain, Region, Season } from "../types";
import { PREF_REGION } from "../prefectures";
import { HOKKAIDO } from "./hokkaido";
import { TOHOKU } from "./tohoku";
import { KANTO } from "./kanto";
import { YAMANASHI } from "./yamanashi";
import { NAGANO } from "./nagano";
import { NIIGATA } from "./niigata";
import { HOKURIKU } from "./hokuriku";
import { TOKAI } from "./tokai";
import { KINKI } from "./kinki";
import { CHUGOKU } from "./chugoku";
import { SHIKOKU } from "./shikoku";
import { KYUSHU } from "./kyushu";
import { EXTRA } from "./extra";

export const RAW_MOUNTAINS: RawMountain[] = [
  ...HOKKAIDO,
  ...TOHOKU,
  ...KANTO,
  ...YAMANASHI,
  ...NAGANO,
  ...NIIGATA,
  ...HOKURIKU,
  ...TOKAI,
  ...KINKI,
  ...CHUGOKU,
  ...SHIKOKU,
  ...KYUSHU,
  ...EXTRA,
];

const SEASON_ORDER: Season[] = ["春", "夏", "秋", "冬"];

function normalize(raw: RawMountain): Mountain {
  const prefectures = raw.p.split("|") as Prefecture[];
  const regions = Array.from(new Set(prefectures.map((p) => PREF_REGION[p]))) as Region[];
  const seasons = SEASON_ORDER.filter((s) => raw.s.includes(s));
  // 体力度を重めに見た総合難易度（1〜5）
  const difficulty = Math.min(5, Math.max(1, Math.round((raw.ph * 0.6 + raw.te * 0.4) * 10) / 10));
  return {
    id: raw.id,
    name: raw.n,
    kana: raw.k,
    elevation: raw.e,
    prefectures,
    municipalities: raw.m.split("|"),
    regions,
    range: raw.r ?? "",
    lists: raw.l ?? [],
    features: raw.f,
    physical: raw.ph,
    technical: raw.te,
    seasons,
    duration: raw.d,
    ropeway: raw.rw === true,
    summary: raw.sm,
    difficulty,
  };
}

/** 標高の高い順に並べた全山リスト */
export const MOUNTAINS: Mountain[] = RAW_MOUNTAINS.map(normalize).sort(
  (a, b) => b.elevation - a.elevation || a.kana.localeCompare(b.kana, "ja"),
);

export const MOUNTAIN_BY_ID = new Map(MOUNTAINS.map((m) => [m.id, m]));

export const TOTAL_MOUNTAINS = MOUNTAINS.length;

export function getMountain(id: string): Mountain | undefined {
  return MOUNTAIN_BY_ID.get(id);
}
