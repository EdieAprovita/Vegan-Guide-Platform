"use client";

import { useRouter } from "next/navigation";
import { useRecipes } from "@/hooks/useRecipes";
import { RecipeForm } from "@/components/features/recipes/recipe-form";
import type { CreateRecipeData } from "@/lib/api/recipes";

export default function NewRecipePage() {
  const router = useRouter();
  const { createRecipe, isLoading } = useRecipes();

  const handleSubmit = async (data: CreateRecipeData) => {
    try {
      await createRecipe(data);
      router.push("/recipes");
    } catch (error) {
      console.error("Failed to create recipe:", error);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold font-['Playfair_Display'] text-emerald-800">
            Create New Recipe
          </h1>
          <p className="text-lg text-emerald-600">
            Share your favorite vegan recipe with our community
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
} 