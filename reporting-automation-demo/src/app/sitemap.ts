import type { MetadataRoute } from "next";

const baseUrl = "https://clearflowreporting.ca";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/case-study`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
