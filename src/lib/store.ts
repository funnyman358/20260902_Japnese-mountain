"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Ascent, Wish } from "./types";

const nowIso = () => new Date().toISOString();
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type AscentInput = {
  mountainId: string;
  date?: string | null;
  weather?: Ascent["weather"];
  companions?: string;
  rating?: number;
  note?: string;
};

type StoreState = {
  ascents: Record<string, Ascent>;
  wishes: Record<string, Wish>;
  displayName: string;
  /** 端末間同期のキー（未設定ならローカル保存のみ） */
  syncKey: string | null;
  lastSyncedAt: string | null;
  hydrated: boolean;
  addAscent: (input: AscentInput) => string;
  updateAscent: (id: string, patch: Partial<AscentInput>) => void;
  removeAscent: (id: string) => void;
  /** その山の記録をすべて削除（登頂チェックを外す） */
  clearMountain: (mountainId: string) => void;
  /** ワンタップで「登った / 未登頂」を切り替える */
  toggleClimbed: (mountainId: string) => boolean;
  toggleWish: (mountainId: string) => void;
  setDisplayName: (name: string) => void;
  setSyncKey: (key: string | null) => void;
  setLastSyncedAt: (v: string | null) => void;
  mergeRemote: (ascents: Ascent[], wishes: Wish[]) => void;
  replaceAll: (data: { ascents: Ascent[]; wishes: Wish[]; displayName?: string }) => void;
  resetAll: () => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ascents: {},
      wishes: {},
      displayName: "",
      syncKey: null,
      lastSyncedAt: null,
      hydrated: false,

      addAscent: (input) => {
        const id = newId();
        const ts = nowIso();
        const ascent: Ascent = {
          id,
          mountainId: input.mountainId,
          date: input.date === undefined ? todayStr() : input.date,
          weather: input.weather,
          companions: input.companions,
          rating: input.rating,
          note: input.note,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ ascents: { ...s.ascents, [id]: ascent } }));
        return id;
      },

      updateAscent: (id, patch) => {
        set((s) => {
          const prev = s.ascents[id];
          if (!prev) return s;
          return {
            ascents: {
              ...s.ascents,
              [id]: { ...prev, ...patch, updatedAt: nowIso() },
            },
          };
        });
      },

      removeAscent: (id) => {
        set((s) => {
          const prev = s.ascents[id];
          if (!prev) return s;
          return {
            ascents: { ...s.ascents, [id]: { ...prev, deleted: true, updatedAt: nowIso() } },
          };
        });
      },

      clearMountain: (mountainId) => {
        set((s) => {
          const next = { ...s.ascents };
          for (const a of Object.values(s.ascents)) {
            if (a.mountainId === mountainId && !a.deleted) {
              next[a.id] = { ...a, deleted: true, updatedAt: nowIso() };
            }
          }
          return { ascents: next };
        });
      },

      toggleClimbed: (mountainId) => {
        const climbed = Object.values(get().ascents).some(
          (a) => a.mountainId === mountainId && !a.deleted,
        );
        if (climbed) {
          get().clearMountain(mountainId);
          return false;
        }
        get().addAscent({ mountainId });
        return true;
      },

      toggleWish: (mountainId) => {
        set((s) => {
          const prev = s.wishes[mountainId];
          const next: Wish = {
            mountainId,
            updatedAt: nowIso(),
            deleted: prev ? !prev.deleted : false,
          };
          return { wishes: { ...s.wishes, [mountainId]: next } };
        });
      },

      setDisplayName: (name) => set({ displayName: name }),
      setSyncKey: (key) => set({ syncKey: key, lastSyncedAt: null }),
      setLastSyncedAt: (v) => set({ lastSyncedAt: v }),

      mergeRemote: (remoteAscents, remoteWishes) => {
        set((s) => {
          const ascents = { ...s.ascents };
          for (const r of remoteAscents) {
            const local = ascents[r.id];
            if (!local || r.updatedAt > local.updatedAt) ascents[r.id] = r;
          }
          const wishes = { ...s.wishes };
          for (const r of remoteWishes) {
            const local = wishes[r.mountainId];
            if (!local || r.updatedAt > local.updatedAt) wishes[r.mountainId] = r;
          }
          return { ascents, wishes };
        });
      },

      replaceAll: ({ ascents, wishes, displayName }) => {
        set({
          ascents: Object.fromEntries(ascents.map((a) => [a.id, a])),
          wishes: Object.fromEntries(wishes.map((w) => [w.mountainId, w])),
          ...(displayName !== undefined ? { displayName } : {}),
        });
      },

      resetAll: () => set({ ascents: {}, wishes: {}, lastSyncedAt: null }),
    }),
    {
      name: "yamacomp-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        ascents: s.ascents,
        wishes: s.wishes,
        displayName: s.displayName,
        syncKey: s.syncKey,
        lastSyncedAt: s.lastSyncedAt,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  // ローカル保存からの復元が終わったら hydrated を立てる
  if (useStore.persist.hasHydrated()) useStore.setState({ hydrated: true });
  useStore.persist.onFinishHydration(() => useStore.setState({ hydrated: true }));
}

export const selectActiveAscents = (s: StoreState) =>
  Object.values(s.ascents).filter((a) => !a.deleted);

export const selectWishIds = (s: StoreState) =>
  Object.values(s.wishes)
    .filter((w) => !w.deleted)
    .map((w) => w.mountainId);
