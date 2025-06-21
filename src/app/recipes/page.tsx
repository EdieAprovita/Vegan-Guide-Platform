import { SimpleRecipeList } from "@/components/features/recipes/simple-recipe-list";

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