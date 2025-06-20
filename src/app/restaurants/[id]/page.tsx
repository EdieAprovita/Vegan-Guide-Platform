import { RestaurantDetailClient } from "@/components/features/restaurants/restaurant-detail-client";

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = await params;
  
  return <RestaurantDetailClient restaurantId={id} />;
} 