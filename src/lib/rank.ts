/** レベル・称号の定義 */

export type Rank = {
  /** この称号に到達する登頂数 */
  min: number;
  name: string;
  emoji: string;
  description: string;
};

export const RANKS: Rank[] = [
  { min: 0, name: "ふもとの旅人", emoji: "🌱", description: "はじまりの一歩を待つ人" },
  { min: 1, name: "はじめの一座", emoji: "👣", description: "記念すべき最初の頂に立った" },
  { min: 5, name: "里山ハイカー", emoji: "🥾", description: "山歩きの楽しさを知りはじめた" },
  { min: 10, name: "山歩きの徒", emoji: "🎒", description: "10座。もう立派な登山者" },
  { min: 20, name: "稜線を知る者", emoji: "⛰️", description: "20座。山域の広がりが見えてきた" },
  { min: 35, name: "縦走者", emoji: "🧭", description: "35座。尾根から尾根へ" },
  { min: 50, name: "岳人", emoji: "🏔️", description: "50座。山があなたの一部になった" },
  { min: 75, name: "山旅の達人", emoji: "🗺️", description: "75座。日本の山を旅する人" },
  { min: 100, name: "百座の証", emoji: "💯", description: "100座到達。並大抵ではない" },
  { min: 150, name: "山岳研究家", emoji: "📚", description: "150座。もはや生き字引" },
  { min: 200, name: "峰々の記録者", emoji: "✍️", description: "200座。歩いた分だけ地図になる" },
  { min: 300, name: "日本山岳マスター", emoji: "🥇", description: "300座。到達者はごくわずか" },
  { min: 450, name: "レジェンド・クライマー", emoji: "🔥", description: "450座。伝説の領域" },
  { min: 600, name: "日本山岳王", emoji: "👑", description: "600座。もはや日本の山の生き証人" },
];

export function rankFor(climbedCount: number): { current: Rank; next: Rank | null } {
  let current = RANKS[0];
  let next: Rank | null = null;
  for (let i = 0; i < RANKS.length; i += 1) {
    if (climbedCount >= RANKS[i].min) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null;
    }
  }
  return { current, next };
}

/**
 * 経験値は「登った山の標高の合計(m)」。
 * レベルが上がるほど必要量が増える緩やかな曲線。
 */
export function levelForXp(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progress: number;
} {
  let level = 1;
  let need = 1000;
  let acc = 0;
  while (xp >= acc + need && level < 999) {
    acc += need;
    level += 1;
    need = Math.round((1000 + (level - 1) * 420) / 10) * 10;
  }
  return {
    level,
    currentLevelXp: xp - acc,
    nextLevelXp: need,
    progress: need === 0 ? 1 : (xp - acc) / need,
  };
}

/** 累積標高のたとえ話 */
export function elevationMetaphors(totalMeters: number): { label: string; value: string }[] {
  return [
    { label: "富士山", value: `${(totalMeters / 3776).toFixed(1)} 回分` },
    { label: "エベレスト", value: `${(totalMeters / 8849).toFixed(1)} 回分` },
    { label: "東京スカイツリー", value: `${(totalMeters / 634).toFixed(1)} 回分` },
    { label: "成層圏(11km)まで", value: `${Math.min(100, (totalMeters / 11000) * 100).toFixed(1)} %` },
  ];
}
