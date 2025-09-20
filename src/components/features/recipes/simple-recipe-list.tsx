"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [mounted, setMounted] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [categoryValue, setCategoryValue] = useState(initialCategory);
  const [difficultyValue, setDifficultyValue] = useState(initialDifficulty);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchRecipes = useCallback(
    async (isLoadMore = false, currentPage?: number) => {
      if (!mounted) return;

      // Use the passed currentPage or calculate based on isLoadMore
      const targetPage = currentPage ?? (isLoadMore ? page + 1 : 1);

      console.log("Fetching recipes with params:", {
        page: targetPage,
        limit: initialLimit,
        search: searchValue,
        category: categoryValue,
        difficulty: difficultyValue,
      });

      try {
        setIsLoading(true);
        setError(null);

        const params = {
          page: targetPage,
          limit: initialLimit,
          search: searchValue.trim(),
          category: categoryValue,
          difficulty: difficultyValue,
        };

        const response = await getRecipes(params);

        // Process backend response using the universal helper
        const recipesData = processBackendResponse<Recipe>(response);

        // Ensure we always work with arrays
        const recipesArray = Array.isArray(recipesData) ? recipesData : [];

        if (isLoadMore) {
          setRecipes((prev) => [...(Array.isArray(prev) ? prev : []), ...recipesArray]);
          setPage(targetPage);
        } else {
          setRecipes(recipesArray);
          setPage(1);
        }

        setHasMore(recipesArray.length === initialLimit);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load recipes";
        setError(errorMessage);
        toast.error(errorMessage);

        if (!isLoadMore) {
          setRecipes([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [mounted, searchValue, categoryValue, difficultyValue, initialLimit, page]
  );

  useEffect(() => {
    if (mounted) {
      fetchRecipes();
    }
  }, [mounted, fetchRecipes]);

  const handleSearch = (search: string) => {
    setSearchValue(search);
    setPage(1);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryValue(category);
    setPage(1);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setDifficultyValue(difficulty);
    setPage(1);
  };

  const handleLoadMore = () => {
    fetchRecipes(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500" />
        </div>

        {/* Simple dropdown replacements */}
        <select
          value={categoryValue}
          onChange={(e) => handleCategoryChange(e.target.value)}
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
          className="border-input focus:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none sm:w-[180px]"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {isLoading && recipes.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: initialLimit }).map((_, i) => (
            <div key={i} className="h-[400px] animate-pulse rounded-lg bg-emerald-100" />
          ))}
        </div>
      ) : !recipes || !Array.isArray(recipes) || recipes.length === 0 ? (
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
                preparationTime={recipe.preparationTime || 10}
                cookingTime={recipe.cookingTime}
                servings={recipe.servings || 4}
                difficulty={recipe.difficulty || "medium"}
                averageRating={recipe.averageRating || recipe.rating || 0}
                author={{
                  username: "Recipe Author",
                  photo: undefined,
                }}
                onView={() => {
                  window.location.href = `/recipes/${recipe._id}`;
                }}
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
