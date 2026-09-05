"use client";

import { useEffect, useState } from "react";
import type { Mountain } from "@/data/types";
import { WEATHERS, type Ascent } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useToast } from "./Toast";

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function RecordSheet(props: {
  mountain: Mountain;
  ascent?: Ascent;
  open: boolean;
  onClose: () => void;
}) {
  if (!props.open) return null;
  // 開くたびに初期値から作り直す（key でリマウント）
  return <RecordSheetInner key={props.ascent?.id ?? "new"} {...props} />;
}

function RecordSheetInner({
  mountain,
  ascent,
  onClose,
}: {
  mountain: Mountain;
  ascent?: Ascent;
  open: boolean;
  onClose: () => void;
}) {
  const addAscent = useStore((s) => s.addAscent);
  const updateAscent = useStore((s) => s.updateAscent);
  const removeAscent = useStore((s) => s.removeAscent);
  const toast = useToast();

  const [date, setDate] = useState(ascent?.date ?? today());
  const [weather, setWeather] = useState<Ascent["weather"] | undefined>(ascent?.weather);
  const [rating, setRating] = useState<number>(ascent?.rating ?? 0);
  const [companions, setCompanions] = useState(ascent?.companions ?? "");
  const [note, setNote] = useState(ascent?.note ?? "");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const save = () => {
    const payload = {
      mountainId: mountain.id,
      date: date || null,
      weather,
      rating: rating || undefined,
      companions: companions.trim() || undefined,
      note: note.trim() || undefined,
    };
    if (ascent) {
      updateAscent(ascent.id, payload);
      toast.push({ emoji: "✏️", title: "記録を更新しました" });
    } else {
      addAscent(payload);
      toast.push({
        emoji: "🎉",
        title: `${mountain.name} に登頂！`,
        body: `標高 ${mountain.elevation.toLocaleString()}m を記録しました`,
        tone: "celebrate",
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        className="animate-rise max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-ink-subtle">
              {ascent ? "記録を編集" : "登頂を記録"}
            </p>
            <h2 className="text-lg font-black">{mountain.name}</h2>
            <p className="text-xs text-ink-muted">
              {mountain.elevation.toLocaleString()}m ・ {mountain.prefectures.join("・")}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-sm font-bold text-ink-muted"
          >
            ✕
          </button>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-bold text-ink-muted">登頂日</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-sm"
          />
        </label>

        <div className="mb-3">
          <span className="mb-1 block text-xs font-bold text-ink-muted">天気</span>
          <div className="flex flex-wrap gap-1.5">
            {WEATHERS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWeather(weather === w ? undefined : w)}
                className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                  weather === w
                    ? "bg-[var(--brand)] text-white"
                    : "bg-[var(--surface-2)] text-ink-muted"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <span className="mb-1 block text-xs font-bold text-ink-muted">思い出度</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i}点`}
                onClick={() => setRating(rating === i ? 0 : i)}
                className="text-2xl leading-none transition hover:scale-110"
              >
                <span className={i <= rating ? "" : "opacity-25 grayscale"}>⭐</span>
              </button>
            ))}
          </div>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-bold text-ink-muted">同行者</span>
          <input
            type="text"
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            placeholder="ひとり / 家族と / 山仲間と"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-sm"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-bold text-ink-muted">メモ</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="コース、天候、出会った景色など"
            className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2 text-sm"
          />
        </label>

        <div className="flex gap-2">
          {ascent ? (
            <button
              type="button"
              onClick={() => {
                removeAscent(ascent.id);
                toast.push({ emoji: "🗑️", title: "記録を削除しました" });
                onClose();
              }}
              className="rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-bold text-ink-muted"
            >
              削除
            </button>
          ) : null}
          <button
            type="button"
            onClick={save}
            className="flex-1 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-black text-white shadow-sm transition active:scale-[0.99]"
          >
            {ascent ? "更新する" : "登頂を記録する"}
          </button>
        </div>
      </div>
    </div>
  );
}
