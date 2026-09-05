import type { Metadata } from "next";
import { AccountView } from "@/components/AccountView";

export const metadata: Metadata = {
  title: "アカウントとデータ",
  description: "スマホとPCの同期設定、バックアップの書き出し・読み込み。",
};

export default function AccountPage() {
  return <AccountView />;
}
