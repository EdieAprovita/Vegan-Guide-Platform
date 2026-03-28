"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeCard } from "./recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const PAGE_LIMIT = 12;

interface RecipeListProps {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialCategory?: string;
  initialDifficulty?: string;
}

export function RecipeList({
  initialPage = 1,
  initialLimit = PAGE_LIMIT,
  initialSearch = "",
  initialCategory = "",
  initialDifficulty = "",
}: RecipeListProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [page, setPage] = useState(initialPage);

  const {
    data: recipes = [],
    isLoading,
    isFetching,
    error,
  } = useRecipes({
    page,
    limit: initialLimit,
    search,
    category,
    difficulty,
  });

  const hasMore = recipes.length === initialLimit;

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg text-red-500">
          Error loading recipes: {error instanceof Error ? error.message : "Unknown error"}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search recipes..."
            defaultValue={initialSearch}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-500" />
        </div>
        <Select
          defaultValue={initialCategory}
          onValueChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="dessert">Dessert</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>
        <Select
          defaultValue={initialDifficulty}
          onValueChange={(value) => {
            setDifficulty(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: initialLimit }).map((_, i) => (
            <div key={i} className="h-[400px] rounded-lg bg-emerald-100" />
          ))}
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
                preparationTime={recipe.preparationTime || 0}
                cookingTime={recipe.cookingTime}
                servings={recipe.servings || 1}
                difficulty={recipe.difficulty || "medium"}
                averageRating={recipe.averageRating || recipe.rating}
                author={{
                  username: "Recipe Author",
                  photo: undefined,
                }}
                onView={() => router.push(`/recipes/${recipe._id}`)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-8">
              <Button
                onClick={() => setPage((prev) => prev + 1)}
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
