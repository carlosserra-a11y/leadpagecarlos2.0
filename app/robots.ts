import type { MetadataRoute } from "next";
import { CONFIG } from "@/lib/dados";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${CONFIG.siteUrl}sitemap.xml` };
}
