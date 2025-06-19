"use client";

import { useEffect } from "react";
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

interface RecipeListProps {
  initialPage?: number;
  initialLimit?: number;
  initialSearch?: string;
  initialCategory?: string;
  initialDifficulty?: string;
}

export function RecipeList({
  initialPage = 1,
  initialLimit = 12,
  initialSearch = "",
  initialCategory = "",
  initialDifficulty = "",
}: RecipeListProps) {
  const router = useRouter();
  const {
    recipes,
    isLoading,
    error,
    totalPages,
    currentPage,
    getRecipes,
  } = useRecipes();

  useEffect(() => {
    getRecipes({
      page: initialPage,
      limit: initialLimit,
      search: initialSearch,
      category: initialCategory,
      difficulty: initialDifficulty,
    });
  }, [
    getRecipes,
    initialPage,
    initialLimit,
    initialSearch,
    initialCategory,
    initialDifficulty,
  ]);

  const handleSearch = (search: string) => {
    getRecipes({
      page: 1,
      limit: initialLimit,
      search,
      category: initialCategory,
      difficulty: initialDifficulty,
    });
  };

  const handleCategoryChange = (category: string) => {
    getRecipes({
      page: 1,
      limit: initialLimit,
      search: initialSearch,
      category,
      difficulty: initialDifficulty,
    });
  };

  const handleDifficultyChange = (difficulty: string) => {
    getRecipes({
      page: 1,
      limit: initialLimit,
      search: initialSearch,
      category: initialCategory,
      difficulty,
    });
  };

  const handlePageChange = (page: number) => {
    getRecipes({
      page,
      limit: initialLimit,
      search: initialSearch,
      category: initialCategory,
      difficulty: initialDifficulty,
    });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search recipes..."
            defaultValue={initialSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
        </div>
        <Select
          defaultValue={initialCategory}
          onValueChange={handleCategoryChange}>
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
          onValueChange={handleDifficultyChange}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: initialLimit }).map((_, i) => (
            <div
              key={i}
              className="h-[400px] bg-emerald-100 rounded-lg"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                title={recipe.title}
                description={recipe.description}
                image={recipe.image || "/placeholder-recipe.jpg"}
                preparationTime={recipe.preparationTime}
                cookingTime={recipe.cookingTime}
                servings={recipe.servings}
                difficulty={recipe.difficulty}
                averageRating={recipe.averageRating}
                author={{
                  username: recipe.author.username,
                  photo: recipe.author.photo,
                }}
                onView={() => router.push(`/recipes/${recipe._id}`)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-8">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={
                      page === currentPage
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : ""
                    }>
                    {page}
                  </Button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
} 