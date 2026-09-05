"use client";

import { useEffect, useRef } from "react";
import { useAchievements, useHydrated, useStats } from "@/lib/hooks";
import { rankFor } from "@/lib/rank";
import { useToast } from "./Toast";

/** 実績の解除と称号の昇格を検知してお祝いを表示する */
export function AchievementWatcher() {
  const hydrated = useHydrated();
  const stats = useStats();
  const achievements = useAchievements(stats);
  const toast = useToast();
  const known = useRef<Set<string> | null>(null);
  const knownRank = useRef<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    const unlocked = new Set(achievements.filter((a) => a.unlocked).map((a) => a.id));
    const rank = rankFor(stats.totalClimbed).current;

    if (known.current === null) {
      known.current = unlocked;
      knownRank.current = rank.name;
      return;
    }
    for (const a of achievements) {
      if (a.unlocked && !known.current.has(a.id)) {
        toast.push({
          emoji: a.emoji,
          title: `実績解除！ ${a.name}`,
          body: a.description,
          tone: "celebrate",
        });
      }
    }
    if (knownRank.current && knownRank.current !== rank.name) {
      toast.push({
        emoji: rank.emoji,
        title: `称号が「${rank.name}」になりました`,
        body: rank.description,
        tone: "celebrate",
      });
    }
    known.current = unlocked;
    knownRank.current = rank.name;
  }, [achievements, stats.totalClimbed, hydrated, toast]);

  return null;
}
