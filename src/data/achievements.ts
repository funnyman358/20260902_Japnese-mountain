import { MOUNTAINS } from "./mountains";
import type { Stats } from "@/lib/stats";

export const ACHIEVEMENT_CATEGORIES = [
  "登頂数",
  "名山リスト",
  "エリア制覇",
  "標高・高み",
  "チャレンジ",
  "記録・習慣",
] as const;
export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number];

export type AchievementTier = "ブロンズ" | "シルバー" | "ゴールド" | "プラチナ";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  tier: AchievementTier;
  goal: number;
  unit: string;
  value: (s: Stats) => number;
};

const COUNT_3000 = MOUNTAINS.filter((m) => m.elevation >= 3000).length;
const COUNT_HIGHEST = MOUNTAINS.filter((m) => m.lists.includes("都道府県最高峰")).length;
const COUNT_WORLD_HERITAGE = MOUNTAINS.filter((m) => m.features.includes("世界遺産")).length;
const COUNT_ACTIVE_VOLCANO = MOUNTAINS.filter((m) => m.features.includes("活火山")).length;

export const ACHIEVEMENTS: Achievement[] = [
  // ---- 登頂数 ----
  { id: "first-summit", name: "はじめの一歩", description: "はじめての山を記録する", emoji: "👣",
    category: "登頂数", tier: "ブロンズ", goal: 1, unit: "座", value: (s) => s.totalClimbed },
  { id: "climb-5", name: "山の味を知る", description: "5座に登る", emoji: "🌿",
    category: "登頂数", tier: "ブロンズ", goal: 5, unit: "座", value: (s) => s.totalClimbed },
  { id: "climb-10", name: "二桁の頂", description: "10座に登る", emoji: "🥾",
    category: "登頂数", tier: "ブロンズ", goal: 10, unit: "座", value: (s) => s.totalClimbed },
  { id: "climb-25", name: "山旅の常連", description: "25座に登る", emoji: "🎒",
    category: "登頂数", tier: "シルバー", goal: 25, unit: "座", value: (s) => s.totalClimbed },
  { id: "climb-50", name: "半百の峰", description: "50座に登る", emoji: "⛰️",
    category: "登頂数", tier: "シルバー", goal: 50, unit: "座", value: (s) => s.totalClimbed },
  { id: "climb-100", name: "百座達成", description: "100座に登る", emoji: "💯",
    category: "登頂数", tier: "ゴールド", goal: 100, unit: "座", value: (s) => s.totalClimbed },
  { id: "climb-200", name: "二百座の記憶", description: "200座に登る", emoji: "🏔️",
    category: "登頂数", tier: "ゴールド", goal: 200, unit: "座", value: (s) => s.totalClimbed },
  { id: "climb-300", name: "三百座の踏破者", description: "300座に登る", emoji: "🥇",
    category: "登頂数", tier: "プラチナ", goal: 300, unit: "座", value: (s) => s.totalClimbed },
  { id: "climb-500", name: "五百座の伝説", description: "500座に登る", emoji: "🔥",
    category: "登頂数", tier: "プラチナ", goal: 500, unit: "座", value: (s) => s.totalClimbed },
  { id: "climb-all", name: "完全制覇", description: "収録されたすべての山に登る", emoji: "👑",
    category: "登頂数", tier: "プラチナ", goal: MOUNTAINS.length, unit: "座", value: (s) => s.totalClimbed },

  // ---- 名山リスト ----
  { id: "hyakumeizan-1", name: "百名山デビュー", description: "日本百名山に1座登る", emoji: "🌄",
    category: "名山リスト", tier: "ブロンズ", goal: 1, unit: "座", value: (s) => s.byList["日本百名山"].climbed },
  { id: "hyakumeizan-10", name: "百名山ハンター", description: "日本百名山に10座登る", emoji: "🎯",
    category: "名山リスト", tier: "ブロンズ", goal: 10, unit: "座", value: (s) => s.byList["日本百名山"].climbed },
  { id: "hyakumeizan-25", name: "百名山クォーター", description: "日本百名山に25座登る", emoji: "🌅",
    category: "名山リスト", tier: "シルバー", goal: 25, unit: "座", value: (s) => s.byList["日本百名山"].climbed },
  { id: "hyakumeizan-50", name: "百名山ハーフ", description: "日本百名山に50座登る", emoji: "🌗",
    category: "名山リスト", tier: "シルバー", goal: 50, unit: "座", value: (s) => s.byList["日本百名山"].climbed },
  { id: "hyakumeizan-75", name: "百名山あと少し", description: "日本百名山に75座登る", emoji: "🌘",
    category: "名山リスト", tier: "ゴールド", goal: 75, unit: "座", value: (s) => s.byList["日本百名山"].climbed },
  { id: "hyakumeizan-100", name: "百名山完登", description: "日本百名山をすべて登る", emoji: "🏆",
    category: "名山リスト", tier: "プラチナ", goal: 100, unit: "座", value: (s) => s.byList["日本百名山"].climbed },
  { id: "nihyaku-half", name: "二百名山の道", description: "日本二百名山に25座登る", emoji: "🗻",
    category: "名山リスト", tier: "シルバー", goal: 25, unit: "座", value: (s) => s.byList["日本二百名山"].climbed },
  { id: "nihyaku-all", name: "二百名山完登", description: "収録の日本二百名山をすべて登る", emoji: "🎖️",
    category: "名山リスト", tier: "プラチナ", goal: MOUNTAINS.filter((m) => m.lists.includes("日本二百名山")).length,
    unit: "座", value: (s) => s.byList["日本二百名山"].climbed },
  { id: "sanbyaku-half", name: "三百名山の道", description: "日本三百名山に25座登る", emoji: "🧗",
    category: "名山リスト", tier: "シルバー", goal: 25, unit: "座", value: (s) => s.byList["日本三百名山"].climbed },
  { id: "sanbyaku-all", name: "三百名山完登", description: "収録の日本三百名山をすべて登る", emoji: "🏅",
    category: "名山リスト", tier: "プラチナ", goal: MOUNTAINS.filter((m) => m.lists.includes("日本三百名山")).length,
    unit: "座", value: (s) => s.byList["日本三百名山"].climbed },
  { id: "hana-25", name: "花を追って", description: "花の百名山に25座登る", emoji: "🌸",
    category: "名山リスト", tier: "シルバー", goal: 25, unit: "座", value: (s) => s.byList["花の百名山"].climbed },
  { id: "hana-all", name: "花の百名山完登", description: "収録の花の百名山をすべて登る", emoji: "💐",
    category: "名山リスト", tier: "プラチナ", goal: MOUNTAINS.filter((m) => m.lists.includes("花の百名山")).length,
    unit: "座", value: (s) => s.byList["花の百名山"].climbed },
  { id: "highest-10", name: "県の頂を集める", description: "都道府県最高峰に10座登る", emoji: "📍",
    category: "名山リスト", tier: "シルバー", goal: 10, unit: "座", value: (s) => s.byList["都道府県最高峰"].climbed },
  { id: "highest-all", name: "全都道府県最高峰", description: "収録の都道府県最高峰をすべて登る", emoji: "🗾",
    category: "名山リスト", tier: "プラチナ", goal: COUNT_HIGHEST, unit: "座",
    value: (s) => s.byList["都道府県最高峰"].climbed },

  // ---- エリア制覇 ----
  { id: "pref-1", name: "はじめての県", description: "1つの都道府県で登頂する", emoji: "🚩",
    category: "エリア制覇", tier: "ブロンズ", goal: 1, unit: "県", value: (s) => s.visitedPrefectures.length },
  { id: "pref-5", name: "5県めぐり", description: "5つの都道府県で登頂する", emoji: "🚌",
    category: "エリア制覇", tier: "ブロンズ", goal: 5, unit: "県", value: (s) => s.visitedPrefectures.length },
  { id: "pref-10", name: "10県めぐり", description: "10の都道府県で登頂する", emoji: "🚄",
    category: "エリア制覇", tier: "シルバー", goal: 10, unit: "県", value: (s) => s.visitedPrefectures.length },
  { id: "pref-20", name: "20県めぐり", description: "20の都道府県で登頂する", emoji: "✈️",
    category: "エリア制覇", tier: "シルバー", goal: 20, unit: "県", value: (s) => s.visitedPrefectures.length },
  { id: "pref-30", name: "30県めぐり", description: "30の都道府県で登頂する", emoji: "🧳",
    category: "エリア制覇", tier: "ゴールド", goal: 30, unit: "県", value: (s) => s.visitedPrefectures.length },
  { id: "pref-47", name: "全国踏破", description: "47都道府県すべてで登頂する", emoji: "🗾",
    category: "エリア制覇", tier: "プラチナ", goal: 47, unit: "県", value: (s) => s.visitedPrefectures.length },
  { id: "pref-complete-1", name: "県コンプリート", description: "ある都道府県の収録全山に登る", emoji: "🎊",
    category: "エリア制覇", tier: "ゴールド", goal: 1, unit: "県", value: (s) => s.completedPrefectures.length },
  { id: "pref-complete-5", name: "5県コンプリート", description: "5つの都道府県で収録全山に登る", emoji: "🎇",
    category: "エリア制覇", tier: "プラチナ", goal: 5, unit: "県", value: (s) => s.completedPrefectures.length },
  { id: "region-complete-1", name: "地方制覇", description: "ある地方の収録全山に登る", emoji: "🌏",
    category: "エリア制覇", tier: "プラチナ", goal: 1, unit: "地方", value: (s) => s.completedRegions.length },
  { id: "hokkaido-10", name: "北の大地へ", description: "北海道で10座登る", emoji: "❄️",
    category: "エリア制覇", tier: "シルバー", goal: 10, unit: "座", value: (s) => s.byPrefecture["北海道"].climbed },
  { id: "kyushu-10", name: "九州の山旅", description: "九州・沖縄で10座登る", emoji: "🌺",
    category: "エリア制覇", tier: "シルバー", goal: 10, unit: "座", value: (s) => s.byRegion["九州・沖縄"].climbed },
  { id: "alps-20", name: "アルプスの住人", description: "アルプス・高山の山に20座登る", emoji: "🏔️",
    category: "エリア制覇", tier: "ゴールド", goal: 20, unit: "座", value: (s) => s.byFeature["アルプス・高山"].climbed },
  { id: "island-5", name: "島の山めぐり", description: "海の眺望を持つ山に10座登る", emoji: "🏝️",
    category: "エリア制覇", tier: "シルバー", goal: 10, unit: "座", value: (s) => s.byFeature["海の眺望"].climbed },

  // ---- 標高・高み ----
  { id: "fuji-height", name: "富士山を超えろ", description: "累積標高3,776mを超える", emoji: "🗻",
    category: "標高・高み", tier: "ブロンズ", goal: 3776, unit: "m", value: (s) => s.cumulativeElevation },
  { id: "everest", name: "エベレスト超え", description: "累積標高8,849mを超える", emoji: "🏔️",
    category: "標高・高み", tier: "シルバー", goal: 8849, unit: "m", value: (s) => s.cumulativeElevation },
  { id: "stratosphere", name: "成層圏へ", description: "累積標高11,000mを超える", emoji: "🛫",
    category: "標高・高み", tier: "シルバー", goal: 11000, unit: "m", value: (s) => s.cumulativeElevation },
  { id: "elev-50000", name: "累積5万メートル", description: "累積標高50,000mを超える", emoji: "📈",
    category: "標高・高み", tier: "ゴールド", goal: 50000, unit: "m", value: (s) => s.cumulativeElevation },
  { id: "elev-100000", name: "累積10万メートル", description: "累積標高100,000mを超える", emoji: "🚀",
    category: "標高・高み", tier: "プラチナ", goal: 100000, unit: "m", value: (s) => s.cumulativeElevation },
  { id: "over3000-1", name: "3000mの世界", description: "標高3,000m以上の山に登る", emoji: "☁️",
    category: "標高・高み", tier: "シルバー", goal: 1, unit: "座", value: (s) => s.over3000 },
  { id: "over3000-all", name: "3000m峰コンプリート", description: "収録の3,000m峰すべてに登る", emoji: "🌌",
    category: "標高・高み", tier: "プラチナ", goal: COUNT_3000, unit: "座", value: (s) => s.over3000 },
  { id: "over2500-10", name: "高山の常連", description: "標高2,500m以上に10座登る", emoji: "🧊",
    category: "標高・高み", tier: "ゴールド", goal: 10, unit: "座", value: (s) => s.over2500 },
  { id: "low-30", name: "低山愛好家", description: "標高1,000m未満の山に30座登る", emoji: "🍃",
    category: "標高・高み", tier: "シルバー", goal: 30, unit: "座", value: (s) => s.under1000 },
  { id: "self-power", name: "自分の足で高みへ", description: "ロープウェイのない2,000m峰に10座登る", emoji: "💪",
    category: "標高・高み", tier: "ゴールド", goal: 10, unit: "座", value: (s) => s.noRopewayOver2000 },

  // ---- チャレンジ ----
  { id: "volcano-10", name: "火の山を訪ねて", description: "活火山に10座登る", emoji: "🌋",
    category: "チャレンジ", tier: "シルバー", goal: 10, unit: "座", value: (s) => s.byFeature["活火山"].climbed },
  { id: "volcano-all", name: "活火山コンプリート", description: "収録の活火山すべてに登る", emoji: "♨️",
    category: "チャレンジ", tier: "プラチナ", goal: COUNT_ACTIVE_VOLCANO, unit: "座",
    value: (s) => s.byFeature["活火山"].climbed },
  { id: "heritage", name: "世界遺産の山", description: "世界遺産の山に5座登る", emoji: "🏛️",
    category: "チャレンジ", tier: "シルバー", goal: Math.min(5, COUNT_WORLD_HERITAGE), unit: "座",
    value: (s) => s.byFeature["世界遺産"].climbed },
  { id: "rock-5", name: "岩場を越えて", description: "技術度5の山に登る", emoji: "🧗‍♂️",
    category: "チャレンジ", tier: "ゴールド", goal: 1, unit: "座", value: (s) => s.tech5Count },
  { id: "tough-10", name: "体力の証明", description: "体力度5の山に10座登る", emoji: "🦵",
    category: "チャレンジ", tier: "ゴールド", goal: 10, unit: "座", value: (s) => s.phys5Count },
  { id: "winter-5", name: "冬山を歩く", description: "12〜2月に5回登る", emoji: "⛄",
    category: "チャレンジ", tier: "シルバー", goal: 5, unit: "回", value: (s) => s.winterCount },
  { id: "four-seasons", name: "四季を歩く", description: "春夏秋冬すべてに登山記録を残す", emoji: "🍁",
    category: "チャレンジ", tier: "シルバー", goal: 4, unit: "季節", value: (s) => s.seasons.size },
  { id: "shrine-10", name: "霊山めぐり", description: "信仰・霊山に10座登る", emoji: "⛩️",
    category: "チャレンジ", tier: "シルバー", goal: 10, unit: "座", value: (s) => s.byFeature["信仰・霊山"].climbed },
  { id: "flower-15", name: "花の山を訪ねて", description: "花の名山に15座登る", emoji: "🌼",
    category: "チャレンジ", tier: "シルバー", goal: 15, unit: "座", value: (s) => s.byFeature["花の名山"].climbed },
  { id: "onsen-10", name: "登って浸かる", description: "温泉が近い山に10座登る", emoji: "🧖",
    category: "チャレンジ", tier: "ブロンズ", goal: 10, unit: "座", value: (s) => s.byFeature["温泉が近い"].climbed },
  { id: "multi-peak", name: "一日二山", description: "同じ日に2座以上登る", emoji: "⚡",
    category: "チャレンジ", tier: "ブロンズ", goal: 1, unit: "日", value: (s) => s.multiPeakDays },

  // ---- 記録・習慣 ----
  { id: "streak-3", name: "3か月連続登山", description: "3か月続けて山に登る", emoji: "🔥",
    category: "記録・習慣", tier: "ブロンズ", goal: 3, unit: "か月", value: (s) => s.monthStreak },
  { id: "streak-6", name: "半年連続登山", description: "6か月続けて山に登る", emoji: "🔥",
    category: "記録・習慣", tier: "シルバー", goal: 6, unit: "か月", value: (s) => s.monthStreak },
  { id: "streak-12", name: "12か月連続登山", description: "1年間毎月山に登る", emoji: "🌟",
    category: "記録・習慣", tier: "ゴールド", goal: 12, unit: "か月", value: (s) => s.monthStreak },
  { id: "note-10", name: "記録する人", description: "10件の記録にメモを書く", emoji: "📝",
    category: "記録・習慣", tier: "ブロンズ", goal: 10, unit: "件", value: (s) => s.notedCount },
  { id: "rate-10", name: "忘れられない10座", description: "思い出度★5を10件つける", emoji: "⭐",
    category: "記録・習慣", tier: "シルバー", goal: 10, unit: "件", value: (s) => s.ratedCount },
  { id: "repeat-3", name: "また来たくなる山", description: "同じ山に3回登る", emoji: "🔁",
    category: "記録・習慣", tier: "ブロンズ", goal: 3, unit: "回", value: (s) => s.maxRepeat },
  { id: "days-50", name: "山の日々", description: "50日分の登山を記録する", emoji: "📅",
    category: "記録・習慣", tier: "シルバー", goal: 50, unit: "日", value: (s) => s.activeDays },
  { id: "days-200", name: "山とともに生きる", description: "200日分の登山を記録する", emoji: "🗓️",
    category: "記録・習慣", tier: "プラチナ", goal: 200, unit: "日", value: (s) => s.activeDays },
];

export type AchievementProgress = Achievement & {
  current: number;
  unlocked: boolean;
  rate: number;
  remaining: number;
};

export function evaluateAchievements(stats: Stats): AchievementProgress[] {
  return ACHIEVEMENTS.map((a) => {
    const current = Math.max(0, a.value(stats));
    const unlocked = current >= a.goal;
    return {
      ...a,
      current,
      unlocked,
      rate: a.goal === 0 ? 1 : Math.min(1, current / a.goal),
      remaining: Math.max(0, a.goal - current),
    };
  });
}

export const TIER_STYLE: Record<AchievementTier, { ring: string; chip: string }> = {
  ブロンズ: { ring: "ring-amber-700/40", chip: "bg-amber-700/15 text-amber-800 dark:text-amber-300" },
  シルバー: { ring: "ring-slate-400/50", chip: "bg-slate-400/15 text-slate-700 dark:text-slate-300" },
  ゴールド: { ring: "ring-yellow-500/50", chip: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  プラチナ: { ring: "ring-cyan-400/50", chip: "bg-cyan-400/15 text-cyan-700 dark:text-cyan-300" },
};
