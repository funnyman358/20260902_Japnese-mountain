import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOUNTAINS, getMountain } from "@/data/mountains";
import { MountainDetail } from "@/components/MountainDetail";

export function generateStaticParams() {
  return MOUNTAINS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mountain = getMountain(id);
  if (!mountain) return { title: "山が見つかりません" };
  return {
    title: `${mountain.name}（${mountain.elevation}m）`,
    description: `${mountain.prefectures.join("・")}の${mountain.name}。${mountain.summary}`,
  };
}

export default async function MountainPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mountain = getMountain(id);
  if (!mountain) notFound();
  return <MountainDetail mountain={mountain} />;
}
