import { Metadata } from "next";
import { getRecipe } from "@/lib/api/recipes";
import { RecipeDetailClient } from "../../../components/features/recipes/recipe-detail-client";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RecipeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await getRecipe(id);
    const recipe = response.data;
    return {
      title: `${recipe.title} | Verde Guide`,
      description: recipe.description
        ? `${recipe.description.slice(0, 150)}${recipe.description.length > 150 ? "..." : ""}`
        : `Receta vegana: ${recipe.title}. Tiempo de cocción: ${recipe.cookingTime}. Dificultad: ${recipe.difficulty}.`,
      openGraph: {
        title: `${recipe.title} | Verde Guide`,
        description: recipe.description ?? `Receta vegana: ${recipe.title}`,
        images: recipe.image ? [{ url: recipe.image }] : [],
      },
    };
  } catch {
    return {
      title: "Receta | Verde Guide",
      description: "Detalles de la receta vegana seleccionada.",
    };
  }
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = await params;

  return <RecipeDetailClient recipeId={id} />;
}
