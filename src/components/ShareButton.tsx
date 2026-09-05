"use client";

import { useState } from "react";
import { useStats } from "@/lib/hooks";
import { rankFor } from "@/lib/rank";
import { useToast } from "./Toast";

/** 現在の記録をテキストにして共有・コピーする */
export function ShareButton() {
  const stats = useStats();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const text = [
    "⛰️ ヤマコンプの記録",
    `登頂 ${stats.totalClimbed} / ${stats.totalMountains} 座（${(stats.overall.rate * 100).toFixed(1)}%）`,
    `称号：${rankFor(stats.totalClimbed).current.name}`,
    `累積標高 ${stats.cumulativeElevation.toLocaleString()}m（富士山 ${(stats.cumulativeElevation / 3776).toFixed(1)} 回分）`,
    `日本百名山 ${stats.byList["日本百名山"].climbed}/${stats.byList["日本百名山"].total}・訪れた県 ${stats.visitedPrefectures.length}/47`,
  ].join("\n");

  const share = async () => {
    setBusy(true);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: "ヤマコンプの記録", text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.push({ emoji: "📋", title: "記録をコピーしました", body: "SNSなどに貼り付けできます" });
      }
    } catch {
      // ユーザーが共有をキャンセルした場合は何もしない
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      disabled={busy}
      className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-ink-muted transition hover:border-[var(--brand)]"
    >
      記録を共有
    </button>
  );
}
