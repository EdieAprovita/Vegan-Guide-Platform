"use client";

import { useRecipe } from "@/hooks/useRecipes";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, Users, ChefHat, Star, ArrowLeft, Heart, Share2 } from "lucide-react";

interface RecipeDetailClientProps {
  recipeId: string;
}

export function RecipeDetailClient({ recipeId }: RecipeDetailClientProps) {
  const { data: recipe, isLoading, error } = useRecipe(recipeId);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto animate-pulse px-4 py-8">
        <div className="h-96 rounded-lg bg-emerald-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">
          {error instanceof Error ? error.message : "Failed to load recipe"}
        </p>
      </div>
    );
  }

  if (!recipe) {
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
  }[recipe?.difficulty || "easy"];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6 text-emerald-600 hover:text-emerald-700"
          onClick={() => window.history.back()}
          aria-label="Volver a Recetas"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to Recipes
        </Button>

        <div className="relative h-96 overflow-hidden rounded-xl">
          <Image
            src={recipe.image || "/placeholder-recipe.jpg"}
            alt={recipe.title + " - Receta vegana"}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 896px"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-lg font-medium text-emerald-700">A</span>
              </div>
              <div>
                <p className="text-sm opacity-90">Recipe by</p>
                <p className="font-medium">Author</p>
              </div>
            </div>
            <h1 className="font-['Playfair_Display'] text-4xl font-bold">{recipe.title}</h1>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Clock className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="text-sm opacity-70">Total Time</p>
              <p className="font-medium">
                {(recipe.preparationTime || 0) + recipe.cookingTime} min
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Users className="h-5 w-5" aria-hidden="true" />
            <div>
              <p className="text-sm opacity-70">Servings</p>
              <p className="font-medium">{recipe.servings}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className={`h-5 w-5 ${difficultyColor}`} aria-hidden="true" />
            <div>
              <p className="text-sm opacity-70">Difficulty</p>
              <p className={`font-medium capitalize ${difficultyColor}`}>{recipe.difficulty}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-700">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
            <div>
              <p className="text-sm opacity-70">Rating</p>
              <p className="font-medium">
                {(recipe.averageRating || recipe.rating)?.toFixed(1) || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            aria-label="Guardar receta en favoritos"
          >
            <Heart className="mr-2 h-4 w-4" aria-hidden="true" />
            Save Recipe
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            aria-label="Compartir receta"
          >
            <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
            Share Recipe
          </Button>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-emerald-800">
              Description
            </h2>
            <p className="leading-relaxed text-emerald-600">{recipe.description}</p>
          </div>

          <div>
            <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-emerald-800">
              Ingredients
            </h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-2 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-emerald-800">
              Instructions
            </h2>
            {Array.isArray(recipe.instructions) ? (
              <ol className="list-decimal space-y-3 pl-5 leading-relaxed text-emerald-600">
                {recipe.instructions.map((step: string, index: number) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ) : (
              <ol className="list-decimal space-y-3 pl-5 leading-relaxed text-emerald-600">
                {String(recipe.instructions)
                  .split(/\n+/)
                  .filter((s: string) => s.trim())
                  .map((step: string, index: number) => (
                    <li key={index}>{step.trim()}</li>
                  ))}
              </ol>
            )}
          </div>

          {user && (
            <div>
              <h2 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-emerald-800">
                Rate this Recipe
              </h2>
              <div role="group" aria-label="Calificacion de la receta" className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    aria-label={`Calificar con ${rating} estrellas`}
                    onClick={() => {
                      /* TODO: implement rating */
                    }}
                    className="text-yellow-400 hover:text-yellow-500"
                  >
                    <Star className="h-8 w-8" aria-hidden="true" />
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
