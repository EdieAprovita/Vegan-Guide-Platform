"use client";

import { useEffect } from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  ChefHat,
  Star,
  ArrowLeft,
  Heart,
  Share2,
} from "lucide-react";

interface RecipeDetailPageProps {
  params: {
    id: string;
  };
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { currentRecipe, isLoading, error, getRecipe, rateRecipe } = useRecipes();
  const { user } = useAuth();

  useEffect(() => {
    getRecipe(params.id);
  }, [getRecipe, params.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-96 bg-emerald-100 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!currentRecipe) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-emerald-600">Recipe not found</p>
      </div>
    );
  }

  const difficultyColor = {
    easy: "text-green-500",
    medium: "text-yellow-500",
    hard: "text-red-500",
  }[currentRecipe.difficulty];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6 text-emerald-600 hover:text-emerald-700"
          onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Button>

        <div className="relative h-96 rounded-xl overflow-hidden">
          <Image
            src={currentRecipe.image || "/placeholder-recipe.jpg"}
            alt={currentRecipe.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              {currentRecipe.author.photo ? (
                <Image
                  src={currentRecipe.author.photo}
                  alt={currentRecipe.author.username}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-lg font-medium text-emerald-700">
                    {currentRecipe.author.username[0]}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm opacity-90">Recipe by</p>
                <p className="font-medium">{currentRecipe.author.username}</p>
              </div>
            </div>
            <h1 className="text-4xl font-bold font-['Playfair_Display']">
              {currentRecipe.title}
            </h1>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Clock className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-70">Total Time</p>
              <p className="font-medium">
                {currentRecipe.preparationTime + currentRecipe.cookingTime} min
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Users className="w-5 h-5" />
            <div>
              <p className="text-sm opacity-70">Servings</p>
              <p className="font-medium">{currentRecipe.servings}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className={`w-5 h-5 ${difficultyColor}`} />
            <div>
              <p className="text-sm opacity-70">Difficulty</p>
              <p className={`font-medium capitalize ${difficultyColor}`}>
                {currentRecipe.difficulty}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <div>
              <p className="text-sm opacity-70">Rating</p>
              <p className="font-medium">
                {currentRecipe.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            <Heart className="w-4 h-4 mr-2" />
            Save Recipe
          </Button>
          <Button
            variant="outline"
            className="flex-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            <Share2 className="w-4 h-4 mr-2" />
            Share Recipe
          </Button>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-['Playfair_Display'] text-emerald-800 mb-4">
              Description
            </h2>
            <p className="text-emerald-600 leading-relaxed">
              {currentRecipe.description}
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-['Playfair_Display'] text-emerald-800 mb-4">
              Ingredients
            </h2>
            <ul className="space-y-2">
              {currentRecipe.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold font-['Playfair_Display'] text-emerald-800 mb-4">
              Instructions
            </h2>
            <ol className="space-y-4">
              {currentRecipe.instructions.map((instruction, index) => (
                <li
                  key={index}
                  className="flex gap-4 text-emerald-600 leading-relaxed">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-medium text-emerald-700">
                    {index + 1}
                  </span>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          {user && (
            <div>
              <h2 className="text-2xl font-bold font-['Playfair_Display'] text-emerald-800 mb-4">
                Rate this Recipe
              </h2>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    onClick={() => rateRecipe(currentRecipe._id, rating)}
                    className="text-yellow-400 hover:text-yellow-500">
                    <Star
                      className={`w-8 h-8 ${
                        currentRecipe.ratings.some(
                          (r) => r.user === user._id && r.rating >= rating
                        )
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 