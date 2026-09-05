/** 登頂記録（1回の登山＝1レコード。同じ山に何度でも記録できる） */
export type Ascent = {
  id: string;
  mountainId: string;
  /** 登頂日 YYYY-MM-DD（不明な場合は null） */
  date: string | null;
  weather?: Weather;
  companions?: string;
  /** 5段階の思い出度 */
  rating?: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
};

export const WEATHERS = ["晴れ", "曇り", "雨", "雪", "霧", "強風"] as const;
export type Weather = (typeof WEATHERS)[number];

/** 登りたい山リスト */
export type Wish = {
  mountainId: string;
  updatedAt: string;
  deleted?: boolean;
};

export type SyncStatus = "idle" | "syncing" | "error" | "offline";
