import type { Metadata } from "next";
import { site } from "@/lib/site";

type PageSeo = { title: string; description: string; path: string };

// Per page metadata. Title gets the site name from the template in the root layout.
export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: path,
    },
    twitter: {
      title: `${title} | ${site.name}`,
      description,
    },
  };
}
