import type { Metadata } from "next";
import { AchievementsView } from "@/components/AchievementsView";

export const metadata: Metadata = {
  title: "実績",
  description: "登頂数・名山リスト・エリア制覇・標高など、さまざまな実績バッジを集めよう。",
};

export default function AchievementsPage() {
  return <AchievementsView />;
}
