"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeCard } from "./recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const PAGE_LIMIT = 12;

interface SimpleRecipeListProps {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialCategory?: string;
  initialDifficulty?: string;
}

export function SimpleRecipeList({
  initialPage = 1,
  initialLimit = PAGE_LIMIT,
  initialSearch = "",
  initialCategory = "",
  initialDifficulty = "",
}: SimpleRecipeListProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [categoryValue, setCategoryValue] = useState(initialCategory);
  const [difficultyValue, setDifficultyValue] = useState(initialDifficulty);
  const [page, setPage] = useState(initialPage);

  // Debounce search to avoid firing on every keystroke
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const {
    data: recipes = [],
    isLoading,
    error,
    isFetching,
  } = useRecipes({
    page,
    limit: initialLimit,
    search: searchValue.trim(),
    category: categoryValue,
    difficulty: difficultyValue,
  });

  const hasMore = recipes.length === initialLimit;

  // Sync active filters to URL so the page is bookmark-/share-friendly
  const pushFilterParams = useCallback(
    (params: { search: string; category: string; difficulty: string; page: number }) => {
      const qs = new URLSearchParams();
      const normalizedSearch = params.search.trim();
      if (normalizedSearch) qs.set("search", normalizedSearch);
      if (params.category) qs.set("category", params.category);
      if (params.difficulty) qs.set("difficulty", params.difficulty);
      if (params.page > 1) qs.set("page", String(params.page));
      const queryString = qs.toString();
      router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [router, pathname]
  );

  const handleSearchChange = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchValue(value);
      setPage(1);
      pushFilterParams({
        search: value,
        category: categoryValue,
        difficulty: difficultyValue,
        page: 1,
      });
    }, 400);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryValue(category);
    setPage(1);
    pushFilterParams({ search: searchValue, category, difficulty: difficultyValue, page: 1 });
  };

  const handleDifficultyChange = (difficulty: string) => {
    setDifficultyValue(difficulty);
    setPage(1);
    pushFilterParams({ search: searchValue, category: categoryValue, difficulty, page: 1 });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    pushFilterParams({
      search: searchValue,
      category: categoryValue,
      difficulty: difficultyValue,
      page: nextPage,
    });
  };

  const handleViewRecipe = useCallback(
    (id: string) => {
      router.push(`/recipes/${id}`);
    },
    [router]
  );

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
          <Search
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500"
            aria-hidden="true"
          />
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
          {error instanceof Error ? error.message : "Failed to load recipes"}
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
                disabled={isFetching}
                variant="outline"
                className="min-w-[200px]"
              >
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
