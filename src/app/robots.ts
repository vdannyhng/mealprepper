import type { MetadataRoute } from "next";

/** Only the landing page is public; the app itself is private and not indexed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/$", disallow: "/" },
  };
}
