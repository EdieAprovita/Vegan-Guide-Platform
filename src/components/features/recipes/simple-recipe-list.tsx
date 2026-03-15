"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Recipe, getRecipes } from "@/lib/api/recipes";
import { RecipeCard } from "./recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { processBackendResponse } from "@/lib/api/config";

interface SimpleRecipeListProps {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialCategory?: string;
  initialDifficulty?: string;
}

export function SimpleRecipeList({
  initialPage = 1,
  initialLimit = 12,
  initialSearch = "",
  initialCategory = "",
  initialDifficulty = "",
}: SimpleRecipeListProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [categoryValue, setCategoryValue] = useState(initialCategory);
  const [difficultyValue, setDifficultyValue] = useState(initialDifficulty);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search to avoid firing on every keystroke
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync active filters to URL so the page is bookmark-/share-friendly
  const pushFilterParams = (params: {
    search: string;
    category: string;
    difficulty: string;
    page: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.category) qs.set("category", params.category);
    if (params.difficulty) qs.set("difficulty", params.difficulty);
    if (params.page > 1) qs.set("page", String(params.page));
    const queryString = qs.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  };

  const fetchRecipes = async (opts: {
    search: string;
    category: string;
    difficulty: string;
    targetPage: number;
    append: boolean;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getRecipes({
        page: opts.targetPage,
        limit: initialLimit,
        search: opts.search.trim(),
        category: opts.category,
        difficulty: opts.difficulty,
      });

      const recipesData = processBackendResponse<Recipe>(response);
      const recipesArray = Array.isArray(recipesData) ? recipesData : [];

      if (opts.append) {
        setRecipes((prev) => [...(Array.isArray(prev) ? prev : []), ...recipesArray]);
      } else {
        setRecipes(recipesArray);
      }

      setHasMore(recipesArray.length === initialLimit);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load recipes";
      setError(errorMessage);
      toast.error(errorMessage);
      if (!opts.append) {
        setRecipes([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and filter-change fetch (reset to page 1)
  useEffect(() => {
    if (!mounted) return;
    setPage(1);
    fetchRecipes({
      search: searchValue,
      category: categoryValue,
      difficulty: difficultyValue,
      targetPage: 1,
      append: false,
    });
    pushFilterParams({ search: searchValue, category: categoryValue, difficulty: difficultyValue, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, searchValue, categoryValue, difficultyValue]);

  const handleSearchChange = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchValue(value);
    }, 400);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryValue(category);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setDifficultyValue(difficulty);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes({
      search: searchValue,
      category: categoryValue,
      difficulty: difficultyValue,
      targetPage: nextPage,
      append: true,
    });
    pushFilterParams({ search: searchValue, category: categoryValue, difficulty: difficultyValue, page: nextPage });
  };

  const handleViewRecipe = (id: string) => {
    router.push(`/recipes/${id}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search recipes..."
            defaultValue={initialSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            aria-label="Search recipes"
          />
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500" aria-hidden="true" />
        </div>

        <select
          value={categoryValue}
          onChange={(e) => handleCategoryChange(e.target.value)}
          aria-label="Filter by category"
          className="border-input focus:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none sm:w-[180px]"
        >
          <option value="">All Categories</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="dessert">Dessert</option>
          <option value="snack">Snack</option>
        </select>

        <select
          value={difficultyValue}
          onChange={(e) => handleDifficultyChange(e.target.value)}
          aria-label="Filter by difficulty"
          className="border-input focus:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none sm:w-[180px]"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-red-600">
          {error}
        </div>
      )}

      {isLoading && recipes.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: initialLimit }).map((_, i) => (
            <div key={i} className="h-[400px] animate-pulse rounded-lg bg-emerald-100" />
          ))}
        </div>
      ) : !Array.isArray(recipes) || recipes.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-emerald-600">No recipes found.</p>
          <p className="text-emerald-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                title={recipe.title}
                description={recipe.description}
                image={recipe.image || "/placeholder-recipe.jpg"}
                preparationTime={recipe.preparationTime ?? 10}
                cookingTime={recipe.cookingTime}
                servings={recipe.servings ?? 4}
                difficulty={recipe.difficulty ?? "medium"}
                averageRating={recipe.averageRating ?? recipe.rating ?? 0}
                author={{
                  username: "Recipe Author",
                  photo: undefined,
                }}
                onView={() => handleViewRecipe(recipe._id)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                variant="outline"
                className="min-w-[200px]"
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
