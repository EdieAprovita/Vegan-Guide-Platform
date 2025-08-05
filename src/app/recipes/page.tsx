import { SimpleRecipeList } from "@/components/features/recipes/simple-recipe-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

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
      <div className="max-w-screen-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="outline" size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold font-['Playfair_Display'] text-emerald-800">
            Vegan Recipes
          </h1>
          <p className="text-lg text-emerald-600 max-w-2xl mx-auto">
            Discover delicious plant-based recipes that are good for you and the
            planet. From quick weekday meals to impressive dinner party dishes.
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