import { RecipeList } from "@/components/features/recipes/recipe-list";

interface RecipesPageProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    difficulty?: string;
  };
}

export default function RecipesPage({ searchParams }: RecipesPageProps) {
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

        <RecipeList
          initialPage={Number(searchParams.page) || 1}
          initialLimit={Number(searchParams.limit) || 12}
          initialSearch={searchParams.search || ""}
          initialCategory={searchParams.category || ""}
          initialDifficulty={searchParams.difficulty || ""}
        />
      </div>
    </main>
  );
} 