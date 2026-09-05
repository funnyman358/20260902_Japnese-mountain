"use client";

import { useEffect, useRef, useState } from "react";
import { useSync } from "./SyncProvider";
import { useStore } from "@/lib/store";
import { useHydrated, useStats } from "@/lib/hooks";
import { useToast } from "./Toast";
import { Card, SectionTitle } from "./ui";
import { TOTAL_MOUNTAINS } from "@/data/mountains";
import type { Ascent, Wish } from "@/lib/types";

export function AccountView() {
  const sync = useSync();
  const toast = useToast();
  const hydrated = useHydrated();
  const stats = useStats();
  const displayName = useStore((s) => s.displayName);
  const setDisplayName = useStore((s) => s.setDisplayName);
  const ascents = useStore((s) => s.ascents);
  const wishes = useStore((s) => s.wishes);
  const replaceAll = useStore((s) => s.replaceAll);
  const resetAll = useStore((s) => s.resetAll);

  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const joined = useRef(false);

  // 共有リンク（?join=キー）で開かれたときは自動で参加する
  useEffect(() => {
    if (joined.current) return;
    const param = new URLSearchParams(window.location.search).get("join");
    if (!param) return;
    joined.current = true;
    void sync.joinSync(param).then(() => {
      window.history.replaceState({}, "", "/account");
    });
  }, [sync]);

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.push({ emoji: "📋", title: message });
    } catch {
      toast.push({ emoji: "⚠️", title: "コピーできませんでした", body: text });
    }
  };

  const exportJson = () => {
    const data = {
      app: "yamacomp",
      version: 1,
      exportedAt: new Date().toISOString(),
      displayName,
      ascents: Object.values(ascents),
      wishes: Object.values(wishes),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yamacomp-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.push({ emoji: "💾", title: "バックアップを書き出しました" });
  };

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as {
        ascents?: Ascent[];
        wishes?: Wish[];
        displayName?: string;
      };
      if (!Array.isArray(parsed.ascents)) throw new Error("形式が正しくありません");
      replaceAll({
        ascents: parsed.ascents,
        wishes: parsed.wishes ?? [],
        displayName: parsed.displayName,
      });
      toast.push({ emoji: "📥", title: "データを読み込みました" });
    } catch (e) {
      toast.push({ emoji: "⚠️", title: "読み込みに失敗しました", body: e instanceof Error ? e.message : "" });
    }
  };

  return (
    <div>
      <h1 className="mb-3 text-lg font-black">アカウントとデータ</h1>

      <SectionTitle title="スマホとPCでデータを同期" />
      <Card>
        {!sync.available ? (
          <p className="text-sm text-ink-muted">
            この環境では同期が設定されていません。記録はこの端末の中に保存されます。
          </p>
        ) : sync.syncKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                ☁️
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black">同期中</p>
                <p className="text-[11px] text-ink-subtle">
                  {sync.status === "syncing"
                    ? "同期しています…"
                    : sync.lastSyncedAt
                      ? `最終同期： ${new Date(sync.lastSyncedAt).toLocaleString("ja-JP")}`
                      : "まだ同期していません"}
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold text-ink-muted">同期キー</p>
              <div className="flex items-center gap-2">
                <code className="min-w-0 flex-1 truncate rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 text-sm font-black tracking-wide">
                  {showKey ? sync.syncKey : "•••••-•••••-•••••-•••••"}
                </code>
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="rounded-xl border border-[var(--line)] px-3 py-2.5 text-xs font-bold text-ink-muted"
                >
                  {showKey ? "隠す" : "表示"}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => void copy(sync.syncKey!, "同期キーをコピーしました")}
                  className="rounded-xl border border-[var(--line)] py-2 text-xs font-bold"
                >
                  キーをコピー
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void copy(
                      `${window.location.origin}/account?join=${sync.syncKey}`,
                      "参加リンクをコピーしました",
                    )
                  }
                  className="rounded-xl border border-[var(--line)] py-2 text-xs font-bold"
                >
                  参加リンクをコピー
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-subtle">
                もう一方の端末でこのキーを入力（または参加リンクを開く）と、記録が同じになります。
                キーを知っている人は記録を見られるため、自分だけで保管してください。
              </p>
            </div>

            {sync.error ? <p className="text-xs text-red-500">{sync.error}</p> : null}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void sync.sync()}
                className="flex-1 rounded-xl bg-[var(--brand)] py-2.5 text-sm font-black text-white"
              >
                今すぐ同期
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("この端末の同期を解除します。記録は端末に残ります。")) sync.stopSync();
                }}
                className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-ink-muted"
              >
                解除
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-ink-muted">
              「同期キー」を使って、スマホとPCの記録をひとつにまとめられます。
              メールアドレスもパスワードも不要です。
            </p>
            <div>
              <p className="mb-1 text-xs font-black text-ink-subtle">はじめての端末</p>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await sync.startSync();
                  setShowKey(true);
                  setBusy(false);
                }}
                className="w-full rounded-xl bg-[var(--brand)] py-2.5 text-sm font-black text-white disabled:opacity-60"
              >
                同期を開始してキーを発行
              </button>
            </div>
            <div className="border-t border-[var(--line)] pt-3">
              <p className="mb-1 text-xs font-black text-ink-subtle">もう一方の端末</p>
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="xxxxx-xxxxx-xxxxx-xxxxx"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 text-center text-sm font-black tracking-wide"
              />
              <button
                type="button"
                disabled={busy || keyInput.trim().length < 16}
                onClick={async () => {
                  setBusy(true);
                  const ok = await sync.joinSync(keyInput);
                  if (ok) setKeyInput("");
                  setBusy(false);
                }}
                className="mt-2 w-full rounded-xl border border-[var(--brand)] py-2.5 text-sm font-black text-[var(--brand-strong)] disabled:opacity-60"
              >
                このキーで同期に参加
              </button>
            </div>
          </div>
        )}
      </Card>

      <SectionTitle title="表示名" />
      <Card>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="やまびと"
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 text-sm"
        />
      </Card>

      <SectionTitle title="データの管理" />
      <Card className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={exportJson}
            className="rounded-xl border border-[var(--line)] py-2.5 text-sm font-bold"
          >
            バックアップ書き出し
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border border-[var(--line)] py-2.5 text-sm font-bold"
          >
            バックアップ読み込み
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importJson(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (confirm("この端末の記録をすべて削除します。よろしいですか？")) {
              resetAll();
              toast.push({ emoji: "🧹", title: "記録を削除しました" });
            }
          }}
          className="w-full rounded-xl border border-red-400/40 py-2.5 text-sm font-bold text-red-500"
        >
          記録をすべて削除
        </button>
        {hydrated ? (
          <p className="text-[11px] text-ink-subtle">
            現在 {stats.totalClimbed} 座 / {TOTAL_MOUNTAINS} 座、記録 {stats.totalAscents} 件。
          </p>
        ) : null}
      </Card>

      <SectionTitle title="このアプリについて" />
      <Card className="space-y-2 text-xs leading-relaxed text-ink-muted">
        <p>
          ヤマコンプは、日本各地の登山対象の山 {TOTAL_MOUNTAINS} 座を収録した登頂記録アプリです。
          日本百名山・二百名山・三百名山を軸に、47都道府県すべての主要な山を掲載しています。
        </p>
        <p>
          標高・所在地・難易度などのデータは一般に知られている情報をもとに整理したものです。
          実際の登山計画では、最新の登山地図・自治体や山小屋の情報・気象条件を必ずご確認ください。
          活火山は噴火警戒レベルにより登山規制が変わります。
        </p>
        <p>
          記録はまず端末内に保存され、同期キーを設定するとクラウド経由で他の端末と共有されます。
          ホーム画面に追加すると、アプリのように全画面で使えます。
        </p>
      </Card>
    </div>
  );
}
