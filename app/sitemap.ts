import type { MetadataRoute } from "next";
import { CONFIG } from "@/lib/dados";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: CONFIG.siteUrl, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
