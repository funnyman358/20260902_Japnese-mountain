"use client";

import { getSupabase } from "./supabase";
import { useStore } from "./store";
import type { Ascent, Wish } from "./types";

function friendly(e: unknown): Error {
  const message = e instanceof Error ? e.message : String(e);
  if (/Failed to fetch|NetworkError|network/i.test(message)) {
    return new Error("ネットワークに接続できませんでした。通信環境を確認してもう一度お試しください。");
  }
  return new Error(message);
}

export type VaultPayload = {
  v: 1;
  displayName?: string;
  ascents: Ascent[];
  wishes: Wish[];
};

type PullResult = { found: boolean; payload?: VaultPayload; updatedAt?: string };

function localPayload(): VaultPayload {
  const s = useStore.getState();
  return {
    v: 1,
    displayName: s.displayName || undefined,
    ascents: Object.values(s.ascents),
    wishes: Object.values(s.wishes),
  };
}

async function pull(key: string): Promise<PullResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("同期が設定されていません");
  const { data, error } = await supabase.rpc("vault_pull", { p_key: key });
  if (error) throw friendly(error);
  return (data ?? { found: false }) as PullResult;
}

async function push(
  key: string,
  payload: VaultPayload,
  expected: string | null,
): Promise<{ ok: boolean; conflict?: boolean; updatedAt?: string }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("同期が設定されていません");
  const { data, error } = await supabase.rpc("vault_push", {
    p_key: key,
    p_payload: payload,
    p_expected: expected,
  });
  if (error) throw friendly(error);
  return data as { ok: boolean; conflict?: boolean; updatedAt?: string };
}

/**
 * 同期キーの保管庫とローカルデータを双方向にすり合わせる。
 * 同じレコードは updatedAt が新しい方を採用し、削除は「削除済みフラグ」で伝える。
 */
export async function syncNow(key: string): Promise<{ merged: number; total: number }> {
  try {
    return await runSync(key);
  } catch (e) {
    throw friendly(e);
  }
}

async function runSync(key: string): Promise<{ merged: number; total: number }> {
  const remote = await pull(key);
  const remotePayload: VaultPayload = remote.found
    ? { v: 1, ascents: [], wishes: [], ...remote.payload }
    : { v: 1, ascents: [], wishes: [] };

  const before = Object.keys(useStore.getState().ascents).length;
  useStore.getState().mergeRemote(remotePayload.ascents ?? [], remotePayload.wishes ?? []);
  if (!useStore.getState().displayName && remotePayload.displayName) {
    useStore.getState().setDisplayName(remotePayload.displayName);
  }

  const merged = localPayload();
  let result = await push(key, merged, remote.updatedAt ?? null);

  if (result.conflict) {
    // 別端末が同時に書き込んだ場合はもう一度取り込んでから書き戻す
    const retry = await pull(key);
    const retryPayload: VaultPayload = retry.found
      ? { v: 1, ascents: [], wishes: [], ...retry.payload }
      : { v: 1, ascents: [], wishes: [] };
    useStore.getState().mergeRemote(retryPayload.ascents ?? [], retryPayload.wishes ?? []);
    result = await push(key, localPayload(), retry.updatedAt ?? null);
    if (!result.ok) throw new Error("他の端末と競合しました。もう一度お試しください。");
  }

  useStore.getState().setLastSyncedAt(new Date().toISOString());
  const after = Object.keys(useStore.getState().ascents).length;
  return { merged: Math.max(0, after - before), total: after };
}
