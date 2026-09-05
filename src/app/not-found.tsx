import Link from "next/link";

export default function NotFound() {
  return (
    <div className="card mt-6 flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="text-4xl" aria-hidden>🧭</span>
      <h1 className="text-lg font-black">ページが見つかりませんでした</h1>
      <p className="text-sm text-ink-muted">道を間違えたようです。ホームに戻りましょう。</p>
      <Link href="/" className="mt-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-black text-white">
        ホームへ
      </Link>
    </div>
  );
}
