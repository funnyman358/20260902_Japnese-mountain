import type { Metadata } from "next";
import { MapView } from "@/components/MapView";

export const metadata: Metadata = {
  title: "日本地図",
  description: "47都道府県ごとの登頂率を日本地図で可視化。県コンプリートを目指しましょう。",
};

export default function MapPage() {
  return <MapView />;
}
