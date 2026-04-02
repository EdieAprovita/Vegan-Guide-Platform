/**
 * JSON-LD structured data components for Schema.org markup.
 *
 * Usage: render any of the exported components inside a Server Component's JSX.
 * Next.js 14 hoists <script> tags placed in the <head> or <body> automatically,
 * so no Next/Script wrapper is needed for inline JSON-LD.
 *
 * All schema types follow Schema.org vocabulary:
 * https://schema.org
 */

// ---------------------------------------------------------------------------
// Primitive renderer
// ---------------------------------------------------------------------------

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Escapes characters that can terminate a <script> block, preventing stored
 * XSS when backend-controlled strings are embedded in JSON-LD output.
 * See: https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html
 */
function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

/**
 * Renders a raw JSON-LD <script> block. Prefer the typed helpers below.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonStringify(data) }}
    />
  );
}

// ---------------------------------------------------------------------------
// Site-level schemas (add to root layout or home page)
// ---------------------------------------------------------------------------

/**
 * WebSite schema — enables Google Sitelinks Searchbox when combined with
 * the SearchAction potentialAction.
 */
export function WebsiteJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verdeguide.com";

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Verde Guide",
        url: siteUrl,
        description: "Tu Compañero Definitivo para el Estilo de Vida Vegano",
        inLanguage: "es",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/**
 * Organization schema — links the brand identity to the site.
 */
export function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verdeguide.com";

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Verde Guide",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo-512.png`,
          width: 512,
          height: 512,
        },
        description:
          "Descubre restaurantes veganos, recetas nutritivas, doctores especializados y mercados orgánicos.",
        sameAs: [],
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  /** Path relative to site root, e.g. "/restaurants" */
  url: string;
}

/**
 * BreadcrumbList schema — improves rich-result breadcrumb trails in SERPs.
 */
export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://verdeguide.com";

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${siteUrl}${item.url}`,
        })),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Restaurant / food
// ---------------------------------------------------------------------------

export interface RestaurantJsonLdProps {
  restaurantName?: string;
  /** Fallback when restaurantName is absent */
  name?: string;
  address?: string;
  rating?: number;
  numReviews?: number;
  cuisine?: string[];
  image?: string;
  url?: string;
}

/**
 * Restaurant schema — eligible for rich results in local search.
 */
export function RestaurantJsonLd({ restaurant }: { restaurant: RestaurantJsonLdProps }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: restaurant.restaurantName ?? restaurant.name,
        ...(restaurant.url && { url: restaurant.url }),
        ...(restaurant.address && {
          address: {
            "@type": "PostalAddress",
            streetAddress: restaurant.address,
          },
        }),
        servesCuisine: restaurant.cuisine ?? ["Vegan"],
        ...(restaurant.image && { image: restaurant.image }),
        ...(restaurant.rating != null && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: restaurant.rating,
            reviewCount: restaurant.numReviews ?? 0,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Recipe
// ---------------------------------------------------------------------------

export interface RecipeJsonLdProps {
  title: string;
  description?: string;
  /** Minutes */
  cookingTime?: number;
  /** Minutes */
  preparationTime?: number;
  servings?: number;
  ingredients?: string[];
  image?: string;
  rating?: number;
  numReviews?: number;
  author?: string;
  datePublished?: string;
}

/**
 * Recipe schema — eligible for rich results in Google Search.
 */
export function RecipeJsonLd({ recipe }: { recipe: RecipeJsonLdProps }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Recipe",
        name: recipe.title,
        ...(recipe.description && { description: recipe.description }),
        ...(recipe.cookingTime != null && {
          cookTime: `PT${recipe.cookingTime}M`,
        }),
        ...(recipe.preparationTime != null && {
          prepTime: `PT${recipe.preparationTime}M`,
        }),
        ...(recipe.servings != null && {
          recipeYield: `${recipe.servings} porciones`,
        }),
        ...(recipe.ingredients && { recipeIngredient: recipe.ingredients }),
        ...(recipe.image && { image: recipe.image }),
        ...(recipe.author && {
          author: { "@type": "Person", name: recipe.author },
        }),
        ...(recipe.datePublished && { datePublished: recipe.datePublished }),
        recipeCategory: "Vegan",
        recipeCuisine: "Plant-based",
        suitableForDiet: "https://schema.org/VeganDiet",
        ...(recipe.rating != null && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: recipe.rating,
            reviewCount: recipe.numReviews ?? 0,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Local business (markets, shops, etc.)
// ---------------------------------------------------------------------------

export interface LocalBusinessJsonLdProps {
  name: string;
  address?: string;
  rating?: number;
  numReviews?: number;
  image?: string;
  /** Defaults to "LocalBusiness" — override with a more specific Schema.org type */
  businessType?: string;
  url?: string;
}

/**
 * LocalBusiness schema — covers markets, shops, and general businesses.
 */
export function LocalBusinessJsonLd({ business }: { business: LocalBusinessJsonLdProps }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": business.businessType ?? "LocalBusiness",
        name: business.name,
        ...(business.url && { url: business.url }),
        ...(business.address && {
          address: {
            "@type": "PostalAddress",
            streetAddress: business.address,
          },
        }),
        ...(business.image && { image: business.image }),
        ...(business.rating != null && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: business.rating,
            reviewCount: business.numReviews ?? 0,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Healthcare professional
// ---------------------------------------------------------------------------

export interface DoctorJsonLdProps {
  name: string;
  specialty?: string;
  address?: string;
  rating?: number;
  numReviews?: number;
  url?: string;
}

/**
 * Physician schema — represents vegan-friendly doctors/nutritionists.
 */
export function DoctorJsonLd({ doctor }: { doctor: DoctorJsonLdProps }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Physician",
        name: doctor.name,
        ...(doctor.specialty && { medicalSpecialty: doctor.specialty }),
        ...(doctor.url && { url: doctor.url }),
        ...(doctor.address && {
          address: {
            "@type": "PostalAddress",
            streetAddress: doctor.address,
          },
        }),
        ...(doctor.rating != null && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: doctor.rating,
            reviewCount: doctor.numReviews ?? 0,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }}
    />
  );
}
