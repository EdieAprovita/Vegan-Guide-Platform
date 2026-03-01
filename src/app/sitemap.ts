import { MetadataRoute } from "next";
import { getRestaurants } from "@/lib/api/restaurants";
import { getRecipes } from "@/lib/api/recipes";
import { getDoctors } from "@/lib/api/doctors";
import { getMarkets } from "@/lib/api/markets";
import { getBusinesses } from "@/lib/api/businesses";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://verdeguide.com";

type SitemapEntry = MetadataRoute.Sitemap[number];

const staticRoutes: SitemapEntry[] = [
  {
    url: `${baseUrl}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${baseUrl}/restaurants`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/recipes`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${baseUrl}/doctors`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${baseUrl}/markets`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${baseUrl}/businesses`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${baseUrl}/community`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  },
  {
    url: `${baseUrl}/search`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  },
  {
    url: `${baseUrl}/map`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [restaurantEntries, recipeEntries, doctorEntries, marketEntries, businessEntries] =
    await Promise.all([
      fetchRestaurantEntries(),
      fetchRecipeEntries(),
      fetchDoctorEntries(),
      fetchMarketEntries(),
      fetchBusinessEntries(),
    ]);

  return [
    ...staticRoutes,
    ...restaurantEntries,
    ...recipeEntries,
    ...doctorEntries,
    ...marketEntries,
    ...businessEntries,
  ];
}

async function fetchRestaurantEntries(): Promise<SitemapEntry[]> {
  try {
    const response = await getRestaurants({ limit: 1000 });
    return response.data.map((restaurant) => ({
      url: `${baseUrl}/restaurants/${restaurant._id}`,
      lastModified: new Date(restaurant.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

async function fetchRecipeEntries(): Promise<SitemapEntry[]> {
  try {
    const response = await getRecipes({ limit: 1000 });
    return response.data.map((recipe) => ({
      url: `${baseUrl}/recipes/${recipe._id}`,
      lastModified: new Date(recipe.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

async function fetchDoctorEntries(): Promise<SitemapEntry[]> {
  try {
    const response = await getDoctors({ limit: 1000 });
    return response.data.map((doctor) => ({
      url: `${baseUrl}/doctors/${doctor._id}`,
      lastModified: new Date(doctor.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

async function fetchMarketEntries(): Promise<SitemapEntry[]> {
  try {
    const response = await getMarkets({ limit: 1000 });
    return response.data.map((market) => ({
      url: `${baseUrl}/markets/${market._id}`,
      lastModified: new Date(market.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

async function fetchBusinessEntries(): Promise<SitemapEntry[]> {
  try {
    const response = await getBusinesses({ limit: 1000 });
    // getBusinesses returns BackendResponse<Business[]>, so .data is the array
    const businesses = Array.isArray(response.data) ? response.data : [];
    return businesses.map((business) => ({
      url: `${baseUrl}/businesses/${business._id}`,
      lastModified: new Date(business.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}
