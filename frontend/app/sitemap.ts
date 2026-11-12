import type { MetadataRoute } from "next";
import { publicPages, site } from "@/lib/site";

// Fixed date keeps the sitemap static. Update it when public content changes.
const lastModified = new Date("2026-11-11");

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((path) => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
