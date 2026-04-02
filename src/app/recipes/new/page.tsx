"use client";

import { useRouter } from "next/navigation";
import { useRecipeMutations } from "@/hooks/useRecipes";
import { RecipeForm } from "@/components/features/recipes/recipe-form";
import type { CreateRecipeData } from "@/lib/api/recipes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { extractItemData } from "@/lib/api/config";
import type { Recipe } from "@/lib/api/recipes";

export default function NewRecipePage() {
  const router = useRouter();
  const { createRecipe } = useRecipeMutations();

  const handleSubmit = async (data: CreateRecipeData) => {
    try {
      const response = await createRecipe.mutateAsync(data);
      const recipe = extractItemData<Recipe>(response);
      toast.success("Recipe created successfully!");
      router.push(`/recipes/${recipe._id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create recipe";
      toast.error(message);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Link href="/recipes" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Recipes
            </Link>
          </Button>
        </div>

        <div className="space-y-3 text-center">
          <h1 className="font-['Playfair_Display'] text-4xl font-bold text-emerald-800">
            Create New Recipe
          </h1>
          <p className="text-lg text-emerald-600">
            Share your favorite vegan recipe with our community
          </p>
        </div>

        <div className="rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm">
          <RecipeForm onSubmit={handleSubmit} isLoading={createRecipe.isPending} />
        </div>
      </div>
    </main>
  );
}
