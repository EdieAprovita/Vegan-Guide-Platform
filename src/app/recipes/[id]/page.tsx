import { RecipeDetailClient } from "../../../components/features/recipes/recipe-detail-client";

interface RecipeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const { id } = await params;
  
  return <RecipeDetailClient recipeId={id} />;
} 