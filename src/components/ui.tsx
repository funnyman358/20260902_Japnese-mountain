"use client";

import Link from "next/link";

export function ProgressRing({
  rate,
  size = 160,
  stroke = 14,
  children,
}: {
  rate: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, rate));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function Bar({ rate, tone = "brand" }: { rate: number; tone?: "brand" | "accent" | "muted" }) {
  const color =
    tone === "accent" ? "var(--accent)" : tone === "muted" ? "var(--ink-subtle)" : "var(--brand)";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(0, Math.min(1, rate)) * 100}%`,
          background: color,
          transition: "width 600ms cubic-bezier(.2,.8,.2,1)",
        }}
      />
    </div>
  );
}

export function Card({
  children,
  className = "",
  as,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "link";
  href?: string;
}) {
  const cls = `card p-4 ${className}`;
  if (as === "link" && href) {
    return (
      <Link href={href} className={`${cls} block transition hover:border-[var(--brand)]/50`}>
        {children}
      </Link>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function SectionTitle({
  title,
  action,
  hint,
}: {
  title: string;
  action?: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-2 mt-6 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-sm font-black tracking-wide text-ink">{title}</h2>
        {hint ? <p className="text-xs text-ink-subtle">{hint}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Chip({
  children,
  tone = "default",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "default" | "brand" | "accent" | "outline";
  className?: string;
}) {
  const tones = {
    default: "bg-[var(--surface-2)] text-ink-muted",
    brand: "bg-[var(--brand-soft)] text-[var(--brand-strong)]",
    accent: "bg-[var(--accent)]/15 text-[var(--accent)]",
    outline: "border border-[var(--line)] text-ink-muted",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="card px-3 py-3 text-center">
      <p className="text-[11px] font-bold text-ink-subtle">{label}</p>
      <p className="mt-0.5 text-xl font-black tabular-nums">{value}</p>
      {sub ? <p className="text-[11px] text-ink-subtle">{sub}</p> : null}
    </div>
  );
}

export function EmptyState({ emoji, title, body }: { emoji: string; title: string; body?: string }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-10 text-center">
      <span className="text-3xl" aria-hidden>{emoji}</span>
      <p className="text-sm font-bold">{title}</p>
      {body ? <p className="max-w-xs text-xs text-ink-muted">{body}</p> : null}
    </div>
  );
}

export function DifficultyDots({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-subtle">
      {label}
      <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: i <= value ? "var(--brand)" : "var(--surface-3)" }}
          />
        ))}
      </span>
    </span>
  );
}
