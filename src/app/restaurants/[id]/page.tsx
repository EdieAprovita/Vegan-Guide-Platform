import { Metadata } from "next";
import { getRestaurant } from "@/lib/api/restaurants";
import { RestaurantDetailClient } from "@/components/features/restaurants/restaurant-detail-client";

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RestaurantDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await getRestaurant(id);
    const restaurant = response.data;
    return {
      title: `${restaurant.restaurantName || restaurant.name} | Verde Guide`,
      description: `Restaurante vegano en ${restaurant.address}. Rating: ${restaurant.rating}/5. Descubre el menú, reseñas y más.`,
      openGraph: {
        title: `${restaurant.restaurantName || restaurant.name} | Verde Guide`,
        description: `Restaurante vegano en ${restaurant.address}`,
        images: restaurant.image ? [{ url: restaurant.image }] : [],
      },
    };
  } catch {
    return {
      title: "Restaurante | Verde Guide",
      description: "Detalles del restaurante vegano seleccionado.",
    };
  }
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = await params;

  return <RestaurantDetailClient restaurantId={id} />;
}
