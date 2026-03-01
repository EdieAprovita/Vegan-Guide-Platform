import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://verdeguide.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/profile/", "/settings/", "/login", "/register"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
