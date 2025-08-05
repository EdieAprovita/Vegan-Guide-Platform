"use client";

import { useEffect, useState } from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeCard } from "./recipe-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [categoryValue, setCategoryValue] = useState(initialCategory);
  const [difficultyValue, setDifficultyValue] = useState(initialDifficulty);
  
  const {
    recipes,
    isLoading,
    error,
    totalPages,
    currentPage,
    getRecipes,
  } = useRecipes();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log("Fetching recipes with params:", {
        page: initialPage,
        limit: initialLimit,
        search: searchValue,
        category: categoryValue,
        difficulty: difficultyValue,
      });
      
      getRecipes({
        page: initialPage,
        limit: initialLimit,
        search: searchValue,
        category: categoryValue,
        difficulty: difficultyValue,
      }).catch((err) => {
        console.error("Error fetching recipes:", err);
      });
    }
  }, [mounted, getRecipes, initialPage, initialLimit, searchValue, categoryValue, difficultyValue]);

  const handleSearch = (search: string) => {
    setSearchValue(search);
  };

  const handleCategoryChange = (category: string) => {
    setCategoryValue(category);
  };

  const handleDifficultyChange = (difficulty: string) => {
    setDifficultyValue(difficulty);
  };

  const handlePageChange = (page: number) => {
    getRecipes({
      page,
      limit: initialLimit,
      search: searchValue,
      category: categoryValue,
      difficulty: difficultyValue,
    }).catch((err) => {
      console.error("Error changing page:", err);
    });
  };

  // Extract nested ternary into separate function for better readability
  const renderRecipeContent = () => {
    console.log("renderRecipeContent - recipes:", recipes, "isLoading:", isLoading, "error:", error);
    
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: initialLimit }).map((_, i) => (
            <div
              key={i}
              className="h-[400px] bg-emerald-100 rounded-lg"
            />
          ))}
        </div>
      );
    }

    // Safety check: ensure recipes is an array before checking length
    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-emerald-600 text-lg">No recipes found.</p>
          <p className="text-emerald-500">Try adjusting your search criteria.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe._id}
            title={recipe.title}
            description={recipe.description}
            image={recipe.image || "/placeholder-recipe.jpg"}
            preparationTime={recipe.preparationTime || 10} // Default to 10 if not available
            cookingTime={recipe.cookingTime}
            servings={recipe.servings || 4} // Default to 4 if not available
            difficulty={recipe.difficulty || "medium"} // Default to medium if not available
            averageRating={recipe.averageRating || recipe.rating || 0} // Use rating if averageRating not available
            author={{
              username: typeof recipe.author === 'string' ? 'Recipe Author' : recipe.author.username,
              photo: typeof recipe.author === 'string' ? undefined : recipe.author.photo
            }}
            onView={() => {
              // Navigate to recipe detail page
              window.location.href = `/recipes/${recipe._id}`;
            }}
          />
        ))}
      </div>
    );
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-full sm:w-[180px] h-10 bg-gray-200 rounded animate-pulse" />
          <div className="w-full sm:w-[180px] h-10 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[400px] bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-lg">Error loading recipes: {error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
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
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
        </div>
        
        {/* Simple dropdown replacements */}
        <select
          value={categoryValue}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full sm:w-[180px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
          className="w-full sm:w-[180px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {renderRecipeContent()}

      {/* Pagination */}
      {recipes && Array.isArray(recipes) && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          
          <span className="text-sm text-emerald-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
