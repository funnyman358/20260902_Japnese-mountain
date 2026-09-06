import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 全ページを事前生成する完全な静的サイトなので、静的HTMLとして書き出す。
  // ホスティング側のフレームワーク対応に依存せず、そのまま配信できる。
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
