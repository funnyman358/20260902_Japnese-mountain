import { Suspense } from "react";
import type { Metadata } from "next";
import { MountainBrowser } from "@/components/MountainBrowser";
import { TOTAL_MOUNTAINS } from "@/data/mountains";

export const metadata: Metadata = {
  title: "山リスト",
  description: `全${TOTAL_MOUNTAINS}座から都道府県・市町村・山の種類・標高・難易度など多彩な条件で山を探せます。`,
};

export default function MountainsPage() {
  return (
    <div>
      <h1 className="mb-1 text-lg font-black">山リスト</h1>
      <p className="mb-3 text-xs text-ink-muted">
        全 {TOTAL_MOUNTAINS} 座。都道府県・市町村・山の種類・標高・難易度・適期など複数の軸で絞り込めます。
      </p>
      <Suspense fallback={<div className="card p-6 text-center text-sm text-ink-muted">読み込み中…</div>}>
        <MountainBrowser />
      </Suspense>
    </div>
  );
}
