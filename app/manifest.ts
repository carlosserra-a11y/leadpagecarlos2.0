import type { MetadataRoute } from "next";
import { BASE } from "@/lib/asset";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Carlos Serra · Desenvolvedor Full Stack Júnior",
    short_name: "Carlos Serra",
    description: "Sites e sistemas que puxam clientes direto para o seu WhatsApp.",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    background_color: "#02030a",
    theme_color: "#02030a",
    lang: "pt-BR",
    icons: [
      { src: `${BASE}/marca/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE}/marca/icon-512.png`, sizes: "512x512", type: "image/png" },
      { src: `${BASE}/marca/favicon.svg`, sizes: "any", type: "image/svg+xml" },
    ],
  };
}
