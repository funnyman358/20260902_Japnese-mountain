"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { generateSyncKey, isValidSyncKey, normalizeSyncKey, syncAvailable } from "@/lib/supabase";
import { syncNow } from "@/lib/sync";
import { useStore } from "@/lib/store";
import { useToast } from "./Toast";

type SyncState = {
  available: boolean;
  syncKey: string | null;
  status: "idle" | "syncing" | "error";
  error: string | null;
  lastSyncedAt: string | null;
  /** 新しい同期キーを発行してこの端末を親にする */
  startSync: () => Promise<string | null>;
  /** 既存の同期キーに参加する */
  joinSync: (key: string) => Promise<boolean>;
  /** この端末の同期を解除する（データは残る） */
  stopSync: () => void;
  sync: (silent?: boolean) => Promise<void>;
};

const Ctx = createContext<SyncState | null>(null);

export function useSync(): SyncState {
  const v = useContext(Ctx);
  if (!v) throw new Error("SyncProvider の外で useSync が呼ばれました");
  return v;
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"idle" | "syncing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const syncKey = useStore((s) => s.syncKey);
  const setSyncKey = useStore((s) => s.setSyncKey);
  const lastSyncedAt = useStore((s) => s.lastSyncedAt);
  const hydrated = useStore((s) => s.hydrated);
  const ascents = useStore((s) => s.ascents);
  const wishes = useStore((s) => s.wishes);
  const toast = useToast();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNext = useRef(true);

  const sync = useCallback(
    async (silent = false) => {
      const key = useStore.getState().syncKey;
      if (!key || !syncAvailable) return;
      setStatus("syncing");
      setError(null);
      try {
        await syncNow(key);
        setStatus("idle");
        if (!silent) toast.push({ emoji: "🔄", title: "同期が完了しました" });
      } catch (e) {
        setStatus("error");
        const message = e instanceof Error ? e.message : "同期に失敗しました";
        setError(message);
        if (!silent) toast.push({ emoji: "⚠️", title: "同期に失敗しました", body: message });
      }
    },
    [toast],
  );

  // 起動時・復帰時・オンライン復帰時に自動同期
  useEffect(() => {
    if (!hydrated || !syncKey) return;
    const initial = setTimeout(() => void sync(true), 0);
    const onFocus = () => void sync(true);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    return () => {
      clearTimeout(initial);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, [hydrated, syncKey, sync]);

  // データ変更後は少し待ってから自動保存
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    if (!syncKey) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void sync(true), 1500);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ascents, wishes, syncKey, sync]);

  const startSync = useCallback(async () => {
    if (!syncAvailable) return null;
    const key = generateSyncKey();
    setSyncKey(key);
    setStatus("syncing");
    try {
      await syncNow(key);
      setStatus("idle");
      toast.push({ emoji: "🔗", title: "同期を開始しました", body: "同期キーを別の端末で入力してください" });
      return key;
    } catch (e) {
      setStatus("error");
      const message = e instanceof Error ? e.message : "同期に失敗しました";
      setError(message);
      toast.push({ emoji: "⚠️", title: "同期を開始できませんでした", body: message });
      return key;
    }
  }, [setSyncKey, toast]);

  const joinSync = useCallback(
    async (raw: string) => {
      const key = normalizeSyncKey(raw);
      if (!isValidSyncKey(key)) {
        toast.push({ emoji: "⚠️", title: "同期キーの形式が正しくありません" });
        return false;
      }
      setSyncKey(key);
      setStatus("syncing");
      try {
        const r = await syncNow(key);
        setStatus("idle");
        toast.push({
          emoji: "🤝",
          title: "同期しました",
          body: `記録 ${r.total} 件をこの端末と共有しています`,
        });
        return true;
      } catch (e) {
        setStatus("error");
        const message = e instanceof Error ? e.message : "同期に失敗しました";
        setError(message);
        toast.push({ emoji: "⚠️", title: "同期に失敗しました", body: message });
        return false;
      }
    },
    [setSyncKey, toast],
  );

  const stopSync = useCallback(() => {
    setSyncKey(null);
    setStatus("idle");
    setError(null);
    toast.push({ emoji: "🔓", title: "この端末の同期を解除しました" });
  }, [setSyncKey, toast]);

  const value = useMemo<SyncState>(
    () => ({
      available: syncAvailable,
      syncKey,
      status,
      error,
      lastSyncedAt,
      startSync,
      joinSync,
      stopSync,
      sync,
    }),
    [syncKey, status, error, lastSyncedAt, startSync, joinSync, stopSync, sync],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
