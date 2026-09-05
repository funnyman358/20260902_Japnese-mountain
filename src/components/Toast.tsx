"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

export type ToastItem = {
  id: number;
  emoji: string;
  title: string;
  body?: string;
  tone?: "normal" | "celebrate";
};

const ToastContext = createContext<{ push: (t: Omit<ToastItem, "id">) => void }>({
  push: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const push = useCallback((t: Omit<ToastItem, "id">) => {
    seq.current += 1;
    const id = seq.current;
    setItems((prev) => [...prev.slice(-2), { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-8">
        {items.map((t) => (
          <div
            key={t.id}
            className={`animate-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
              t.tone === "celebrate"
                ? "border-[var(--accent)]/40 bg-[var(--surface)]/95"
                : "border-[var(--line)] bg-[var(--surface)]/95"
            }`}
          >
            <span className="text-2xl leading-none">{t.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold">{t.title}</p>
              {t.body ? <p className="mt-0.5 text-xs text-ink-muted">{t.body}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
