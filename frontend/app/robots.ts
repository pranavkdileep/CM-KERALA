import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed in areas are added later and should never be indexed.
      disallow: ["/dashboard", "/submit", "/cmo", "/officer", "/files", "/login", "/register"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
