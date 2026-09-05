import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { SyncProvider } from "@/components/SyncProvider";
import { AchievementWatcher } from "@/components/AchievementWatcher";
import { AppShell } from "@/components/AppShell";
import { ServiceWorker } from "@/components/ServiceWorker";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ヤマコンプ | 日本の山コンプリート手帳",
    template: "%s | ヤマコンプ",
  },
  description:
    "日本全国の登れる山670座を収録。登った山を記録して、都道府県別・名山リスト別のコンプリートを目指す登山記録アプリ。スマホとPCでデータを同期できます。",
  manifest: "/manifest.webmanifest",
  applicationName: "ヤマコンプ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ヤマコンプ",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: "ヤマコンプ",
    title: "ヤマコンプ | 日本の山コンプリート手帳",
    description:
      "日本全国の登れる山670座を収録。登った山を記録して、都道府県別・名山リスト別のコンプリートを目指す登山記録アプリ。",
    images: ["/icon-512.png"],
    locale: "ja_JP",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1512" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-dvh">
        <ToastProvider>
          <SyncProvider>
            <AchievementWatcher />
            <ServiceWorker />
            <AppShell>{children}</AppShell>
          </SyncProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
