import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import {
  JsonLd,
  WebsiteJsonLd,
  OrganizationJsonLd,
  BreadcrumbJsonLd,
  RestaurantJsonLd,
  RecipeJsonLd,
  LocalBusinessJsonLd,
  DoctorJsonLd,
} from "@/lib/seo/json-ld";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Grabs the first <script type="application/ld+json"> from the document
 * and parses its content as JSON.
 */
function getJsonLdData(): Record<string, unknown> {
  const script = document.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();
  return JSON.parse(script!.innerHTML);
}

// ---------------------------------------------------------------------------
// JsonLd (primitive renderer)
// ---------------------------------------------------------------------------

describe("JsonLd", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("renders a <script> tag with type application/ld+json", () => {
    render(<JsonLd data={{ "@type": "Thing", name: "Test" }} />);
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);
  });

  it("serializes the data object as JSON inside the script", () => {
    const data = { "@context": "https://schema.org", "@type": "Thing", name: "Hello" };
    render(<JsonLd data={data} />);
    const parsed = getJsonLdData();
    expect(parsed).toEqual(data);
  });
});

// ---------------------------------------------------------------------------
// WebsiteJsonLd
// ---------------------------------------------------------------------------

describe("WebsiteJsonLd", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("outputs @type WebSite", () => {
    render(<WebsiteJsonLd />);
    expect(getJsonLdData()["@type"]).toBe("WebSite");
  });

  it("outputs name Verde Guide", () => {
    render(<WebsiteJsonLd />);
    expect(getJsonLdData()["name"]).toBe("Verde Guide");
  });

  it("outputs a potentialAction of type SearchAction", () => {
    render(<WebsiteJsonLd />);
    const data = getJsonLdData();
    const action = data["potentialAction"] as Record<string, unknown>;
    expect(action["@type"]).toBe("SearchAction");
  });

  it("uses the NEXT_PUBLIC_SITE_URL env var when set", () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://mysite.example";
    render(<WebsiteJsonLd />);
    expect(getJsonLdData()["url"]).toBe("https://mysite.example");
    process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it("falls back to https://verdeguide.com when env var is absent", () => {
    const original = process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    render(<WebsiteJsonLd />);
    expect(getJsonLdData()["url"]).toBe("https://verdeguide.com");
    process.env.NEXT_PUBLIC_SITE_URL = original;
  });
});

// ---------------------------------------------------------------------------
// OrganizationJsonLd
// ---------------------------------------------------------------------------

describe("OrganizationJsonLd", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("outputs @type Organization", () => {
    render(<OrganizationJsonLd />);
    expect(getJsonLdData()["@type"]).toBe("Organization");
  });

  it("outputs name Verde Guide", () => {
    render(<OrganizationJsonLd />);
    expect(getJsonLdData()["name"]).toBe("Verde Guide");
  });

  it("outputs a logo ImageObject", () => {
    render(<OrganizationJsonLd />);
    const logo = getJsonLdData()["logo"] as Record<string, unknown>;
    expect(logo["@type"]).toBe("ImageObject");
    expect((logo["url"] as string)).toContain("logo-512.png");
  });

  it("includes a description", () => {
    render(<OrganizationJsonLd />);
    expect(typeof getJsonLdData()["description"]).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// BreadcrumbJsonLd
// ---------------------------------------------------------------------------

describe("BreadcrumbJsonLd", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  const items = [
    { name: "Home", url: "/" },
    { name: "Restaurants", url: "/restaurants" },
    { name: "The Green Plate", url: "/restaurants/123" },
  ];

  it("outputs @type BreadcrumbList", () => {
    render(<BreadcrumbJsonLd items={items} />);
    expect(getJsonLdData()["@type"]).toBe("BreadcrumbList");
  });

  it("outputs the correct number of list items", () => {
    render(<BreadcrumbJsonLd items={items} />);
    const elements = getJsonLdData()["itemListElement"] as unknown[];
    expect(elements.length).toBe(3);
  });

  it("sets position starting at 1", () => {
    render(<BreadcrumbJsonLd items={items} />);
    const elements = getJsonLdData()["itemListElement"] as Array<Record<string, unknown>>;
    expect(elements[0]["position"]).toBe(1);
    expect(elements[1]["position"]).toBe(2);
    expect(elements[2]["position"]).toBe(3);
  });

  it("includes name and item URL for each breadcrumb", () => {
    render(<BreadcrumbJsonLd items={items} />);
    const elements = getJsonLdData()["itemListElement"] as Array<Record<string, unknown>>;
    expect(elements[0]["name"]).toBe("Home");
    expect((elements[0]["item"] as string)).toContain("/");
    expect(elements[1]["name"]).toBe("Restaurants");
    expect((elements[2]["name"])).toBe("The Green Plate");
  });
});

// ---------------------------------------------------------------------------
// RestaurantJsonLd
// ---------------------------------------------------------------------------

describe("RestaurantJsonLd", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("outputs @type Restaurant", () => {
    render(<RestaurantJsonLd restaurant={{ restaurantName: "Tacos Veganos" }} />);
    expect(getJsonLdData()["@type"]).toBe("Restaurant");
  });

  it("uses restaurantName as name", () => {
    render(<RestaurantJsonLd restaurant={{ restaurantName: "Tacos Veganos" }} />);
    expect(getJsonLdData()["name"]).toBe("Tacos Veganos");
  });

  it("falls back to name when restaurantName is absent", () => {
    render(<RestaurantJsonLd restaurant={{ name: "Fallback Name" }} />);
    expect(getJsonLdData()["name"]).toBe("Fallback Name");
  });

  it("includes address when provided", () => {
    render(
      <RestaurantJsonLd
        restaurant={{ restaurantName: "R", address: "123 Main St" }}
      />
    );
    const addr = getJsonLdData()["address"] as Record<string, unknown>;
    expect(addr["streetAddress"]).toBe("123 Main St");
  });

  it("does not include address field when not provided", () => {
    render(<RestaurantJsonLd restaurant={{ restaurantName: "R" }} />);
    expect(getJsonLdData()["address"]).toBeUndefined();
  });

  it("includes aggregateRating when rating is provided", () => {
    render(
      <RestaurantJsonLd
        restaurant={{ restaurantName: "R", rating: 4.5, numReviews: 20 }}
      />
    );
    const aggRating = getJsonLdData()["aggregateRating"] as Record<string, unknown>;
    expect(aggRating["ratingValue"]).toBe(4.5);
    expect(aggRating["reviewCount"]).toBe(20);
  });

  it("does not include aggregateRating when rating is absent", () => {
    render(<RestaurantJsonLd restaurant={{ restaurantName: "R" }} />);
    expect(getJsonLdData()["aggregateRating"]).toBeUndefined();
  });

  it("uses default cuisine ['Vegan'] when not provided", () => {
    render(<RestaurantJsonLd restaurant={{ restaurantName: "R" }} />);
    expect(getJsonLdData()["servesCuisine"]).toEqual(["Vegan"]);
  });

  it("uses provided cuisine array", () => {
    render(
      <RestaurantJsonLd
        restaurant={{ restaurantName: "R", cuisine: ["Mexican", "Italian"] }}
      />
    );
    expect(getJsonLdData()["servesCuisine"]).toEqual(["Mexican", "Italian"]);
  });
});

// ---------------------------------------------------------------------------
// RecipeJsonLd
// ---------------------------------------------------------------------------

describe("RecipeJsonLd", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("outputs @type Recipe", () => {
    render(<RecipeJsonLd recipe={{ title: "Vegan Tacos" }} />);
    expect(getJsonLdData()["@type"]).toBe("Recipe");
  });

  it("uses the title as name", () => {
    render(<RecipeJsonLd recipe={{ title: "Vegan Tacos" }} />);
    expect(getJsonLdData()["name"]).toBe("Vegan Tacos");
  });

  it("includes cookTime in PT format when cookingTime is provided", () => {
    render(<RecipeJsonLd recipe={{ title: "Tacos", cookingTime: 30 }} />);
    expect(getJsonLdData()["cookTime"]).toBe("PT30M");
  });

  it("includes prepTime in PT format when preparationTime is provided", () => {
    render(<RecipeJsonLd recipe={{ title: "Tacos", preparationTime: 15 }} />);
    expect(getJsonLdData()["prepTime"]).toBe("PT15M");
  });

  it("includes recipeYield when servings is provided", () => {
    render(<RecipeJsonLd recipe={{ title: "Tacos", servings: 4 }} />);
    expect(getJsonLdData()["recipeYield"]).toBe("4 porciones");
  });

  it("always includes recipeCategory Vegan", () => {
    render(<RecipeJsonLd recipe={{ title: "Tacos" }} />);
    expect(getJsonLdData()["recipeCategory"]).toBe("Vegan");
  });

  it("always includes suitableForDiet VeganDiet", () => {
    render(<RecipeJsonLd recipe={{ title: "Tacos" }} />);
    expect(getJsonLdData()["suitableForDiet"]).toBe("https://schema.org/VeganDiet");
  });

  it("includes author Person when author name is provided", () => {
    render(<RecipeJsonLd recipe={{ title: "Tacos", author: "Chef Jane" }} />);
    const author = getJsonLdData()["author"] as Record<string, unknown>;
    expect(author["@type"]).toBe("Person");
    expect(author["name"]).toBe("Chef Jane");
  });

  it("includes aggregateRating when rating is provided", () => {
    render(<RecipeJsonLd recipe={{ title: "Tacos", rating: 4.2, numReviews: 10 }} />);
    const aggRating = getJsonLdData()["aggregateRating"] as Record<string, unknown>;
    expect(aggRating["ratingValue"]).toBe(4.2);
    expect(aggRating["reviewCount"]).toBe(10);
  });

  it("does not include aggregateRating when rating is absent", () => {
    render(<RecipeJsonLd recipe={{ title: "Tacos" }} />);
    expect(getJsonLdData()["aggregateRating"]).toBeUndefined();
  });

  it("includes recipeIngredient when ingredients are provided", () => {
    render(
      <RecipeJsonLd
        recipe={{ title: "Tacos", ingredients: ["tortilla", "beans", "salsa"] }}
      />
    );
    expect(getJsonLdData()["recipeIngredient"]).toEqual([
      "tortilla",
      "beans",
      "salsa",
    ]);
  });
});

// ---------------------------------------------------------------------------
// LocalBusinessJsonLd
// ---------------------------------------------------------------------------

describe("LocalBusinessJsonLd", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("outputs @type LocalBusiness by default", () => {
    render(<LocalBusinessJsonLd business={{ name: "Green Market" }} />);
    expect(getJsonLdData()["@type"]).toBe("LocalBusiness");
  });

  it("uses a custom businessType when provided", () => {
    render(
      <LocalBusinessJsonLd
        business={{ name: "Green Market", businessType: "GroceryStore" }}
      />
    );
    expect(getJsonLdData()["@type"]).toBe("GroceryStore");
  });

  it("outputs the business name", () => {
    render(<LocalBusinessJsonLd business={{ name: "Green Market" }} />);
    expect(getJsonLdData()["name"]).toBe("Green Market");
  });

  it("includes address when provided", () => {
    render(
      <LocalBusinessJsonLd
        business={{ name: "Green Market", address: "789 Park Ave" }}
      />
    );
    const addr = getJsonLdData()["address"] as Record<string, unknown>;
    expect(addr["streetAddress"]).toBe("789 Park Ave");
  });

  it("includes aggregateRating when rating is provided", () => {
    render(
      <LocalBusinessJsonLd
        business={{ name: "GM", rating: 4.0, numReviews: 50 }}
      />
    );
    const aggRating = getJsonLdData()["aggregateRating"] as Record<string, unknown>;
    expect(aggRating["ratingValue"]).toBe(4.0);
    expect(aggRating["reviewCount"]).toBe(50);
  });

  it("does not include aggregateRating when rating is absent", () => {
    render(<LocalBusinessJsonLd business={{ name: "GM" }} />);
    expect(getJsonLdData()["aggregateRating"]).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// DoctorJsonLd
// ---------------------------------------------------------------------------

describe("DoctorJsonLd", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("outputs @type Physician", () => {
    render(<DoctorJsonLd doctor={{ name: "Dr. Lopez" }} />);
    expect(getJsonLdData()["@type"]).toBe("Physician");
  });

  it("outputs the doctor name", () => {
    render(<DoctorJsonLd doctor={{ name: "Dr. Lopez" }} />);
    expect(getJsonLdData()["name"]).toBe("Dr. Lopez");
  });

  it("includes medicalSpecialty when specialty is provided", () => {
    render(<DoctorJsonLd doctor={{ name: "Dr. Lopez", specialty: "Nutrition" }} />);
    expect(getJsonLdData()["medicalSpecialty"]).toBe("Nutrition");
  });

  it("does not include medicalSpecialty when specialty is absent", () => {
    render(<DoctorJsonLd doctor={{ name: "Dr. Lopez" }} />);
    expect(getJsonLdData()["medicalSpecialty"]).toBeUndefined();
  });

  it("includes address when provided", () => {
    render(
      <DoctorJsonLd doctor={{ name: "Dr. Lopez", address: "111 Health Blvd" }} />
    );
    const addr = getJsonLdData()["address"] as Record<string, unknown>;
    expect(addr["streetAddress"]).toBe("111 Health Blvd");
  });

  it("includes aggregateRating when rating is provided", () => {
    render(
      <DoctorJsonLd doctor={{ name: "Dr. Lopez", rating: 4.9, numReviews: 25 }} />
    );
    const aggRating = getJsonLdData()["aggregateRating"] as Record<string, unknown>;
    expect(aggRating["ratingValue"]).toBe(4.9);
    expect(aggRating["reviewCount"]).toBe(25);
  });

  it("does not include aggregateRating when rating is absent", () => {
    render(<DoctorJsonLd doctor={{ name: "Dr. Lopez" }} />);
    expect(getJsonLdData()["aggregateRating"]).toBeUndefined();
  });

  it("includes url when provided", () => {
    render(
      <DoctorJsonLd doctor={{ name: "Dr. Lopez", url: "https://drlopez.com" }} />
    );
    expect(getJsonLdData()["url"]).toBe("https://drlopez.com");
  });
});
