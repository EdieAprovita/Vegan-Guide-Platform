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
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="font-['Playfair_Display'] text-4xl font-bold text-emerald-800">
            Create New Recipe
          </h1>
          <p className="text-lg text-emerald-600">
            Share your favorite vegan recipe with our community
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          <RecipeForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
