"use client";

import { useMemo } from "react";
import { useStore } from "./store";
import { computeStats, type Stats } from "./stats";
import { evaluateAchievements, type AchievementProgress } from "@/data/achievements";

export function useHydrated(): boolean {
  return useStore((s) => s.hydrated);
}

export function useStats(): Stats {
  const ascents = useStore((s) => s.ascents);
  return useMemo(() => computeStats(Object.values(ascents)), [ascents]);
}

export function useAchievements(stats: Stats): AchievementProgress[] {
  return useMemo(() => evaluateAchievements(stats), [stats]);
}

export function useClimbedMap(): Map<string, number> {
  const ascents = useStore((s) => s.ascents);
  return useMemo(() => {
    const map = new Map<string, number>();
    for (const a of Object.values(ascents)) {
      if (a.deleted) continue;
      map.set(a.mountainId, (map.get(a.mountainId) ?? 0) + 1);
    }
    return map;
  }, [ascents]);
}

export function useWishSet(): Set<string> {
  const wishes = useStore((s) => s.wishes);
  return useMemo(
    () => new Set(Object.values(wishes).filter((w) => !w.deleted).map((w) => w.mountainId)),
    [wishes],
  );
}
