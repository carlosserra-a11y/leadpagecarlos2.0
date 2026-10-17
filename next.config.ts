import type { NextConfig } from "next";

// O site é publicado no GitHub Pages, dentro da pasta do repositório.
// Em dev e no build usamos o mesmo caminho, para os links nunca divergirem.
export const BASE_PATH = "/leadpagecarlos2.0";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
