import type { Metadata } from "next";
import { RecordsView } from "@/components/RecordsView";

export const metadata: Metadata = {
  title: "記録",
  description: "登った山の記録を年別・月別に振り返り、自己ベストや登山ペースを確認できます。",
};

export default function RecordsPage() {
  return <RecordsView />;
}
