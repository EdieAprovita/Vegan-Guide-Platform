import { Metadata } from "next";
import { SimpleRecipeList } from "@/components/features/recipes/simple-recipe-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "Recetas Veganas | Verde Guide",
  description:
    "Descubre deliciosas recetas veganas y plant-based. Desde comidas rápidas entre semana hasta platos especiales para ocasiones importantes. Cocina saludable y sostenible.",
  keywords: [
    "recetas veganas",
    "cocina plant-based",
    "recetas saludables",
    "recetas sin carne",
    "gastronomía vegana",
    "platos veganos",
    "cocina vegana",
  ],
  openGraph: {
    title: "Recetas Veganas | Verde Guide",
    description:
      "Descubre deliciosas recetas veganas y plant-based para todos los gustos y ocasiones.",
  },
};

interface RecipesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    difficulty?: string;
  }>;
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams;

  return (
    <main className="container mx-auto px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Inicio", url: "/" },
          { name: "Recetas", url: "/recipes" },
        ]}
      />
      <div className="mx-auto max-w-screen-2xl space-y-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="space-y-3 text-center">
          <h1 className="font-['Playfair_Display'] text-4xl font-bold text-emerald-800 md:text-5xl">
            Vegan Recipes
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-emerald-600">
            Discover delicious plant-based recipes that are good for you and the planet. From quick
            weekday meals to impressive dinner party dishes.
          </p>
        </div>

        <SimpleRecipeList
          initialPage={Number(params.page) || 1}
          initialLimit={Number(params.limit) || 12}
          initialSearch={params.search || ""}
          initialCategory={params.category || ""}
          initialDifficulty={params.difficulty || ""}
        />
      </div>
    </main>
  );
}
