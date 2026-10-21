import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/raw-data/", "/process/", "/dashboard/"] }],
    sitemap: "https://clearflowreporting.ca/sitemap.xml",
    host: "https://clearflowreporting.ca",
  };
}
