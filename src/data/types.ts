// 山データの型定義と語彙。データファイル(src/data/mountains/*.ts)はこの型に従う。

export const REGIONS = [
  "北海道",
  "東北",
  "関東",
  "甲信越",
  "北陸",
  "東海",
  "近畿",
  "中国",
  "四国",
  "九州・沖縄",
] as const;
export type Region = (typeof REGIONS)[number];

export const PREFECTURES = [
  "北海道",
  "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;
export type Prefecture = (typeof PREFECTURES)[number];

/** 山のリスト区分（選定リスト） */
export const LISTS = [
  "日本百名山",
  "日本二百名山",
  "日本三百名山",
  "花の百名山",
  "都道府県最高峰",
] as const;
export type MountainList = (typeof LISTS)[number];

/** 山の種類・特徴タグ（複数軸フィルタで使用） */
export const FEATURES = [
  "火山",
  "活火山",
  "独立峰",
  "岩稜・岩場",
  "アルプス・高山",
  "原生林・ブナ林",
  "高原・草原",
  "湿原・池塘",
  "カルスト",
  "信仰・霊山",
  "花の名山",
  "紅葉の名所",
  "樹氷・雪山",
  "大展望",
  "縦走向き",
  "海の眺望",
  "温泉が近い",
  "世界遺産",
  "里山・低山",
  "沢・滝",
] as const;
export type Feature = (typeof FEATURES)[number];

export const SEASONS = ["春", "夏", "秋", "冬"] as const;
export type Season = (typeof SEASONS)[number];

export const DURATIONS = ["半日", "日帰り", "1泊2日", "2泊以上"] as const;
export type Duration = (typeof DURATIONS)[number];

/** データファイルに書く生データ（短縮キーで記述量を抑える） */
export type RawMountain = {
  /** 一意なID（ローマ字スラッグ）。記録データの主キーになるため変更禁止。 */
  id: string;
  /** 山名 */
  n: string;
  /** よみがな（ひらがな） */
  k: string;
  /** 標高(m) */
  e: number;
  /** 都道府県（複数は "|" 区切り） */
  p: string;
  /** 市町村（複数は "|" 区切り） */
  m: string;
  /** 山系・山域 */
  r?: string;
  /** 選定リスト */
  l?: MountainList[];
  /** 特徴タグ */
  f: Feature[];
  /** 体力度 1-5 */
  ph: 1 | 2 | 3 | 4 | 5;
  /** 技術度 1-5 */
  te: 1 | 2 | 3 | 4 | 5;
  /** 適期（"春夏秋冬" の部分文字列で指定） */
  s: string;
  /** 標準的な行程 */
  d: Duration;
  /** 山頂近くまでロープウェイ・リフト・車道でアクセスできる */
  rw?: true;
  /** 一言紹介 */
  sm: string;
};

/** アプリ内部で使う正規化済みの山データ */
export type Mountain = {
  id: string;
  name: string;
  kana: string;
  elevation: number;
  prefectures: Prefecture[];
  municipalities: string[];
  regions: Region[];
  range: string;
  lists: MountainList[];
  features: Feature[];
  physical: number;
  technical: number;
  seasons: Season[];
  duration: Duration;
  ropeway: boolean;
  summary: string;
  /** 総合難易度スコア（体力度と技術度の合成 1-5） */
  difficulty: number;
};
