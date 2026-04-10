import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RestaurantFormClient } from "./_components/restaurant-form-client";

export const metadata: Metadata = {
  title: "Add Restaurant — Vegan Guide",
  description: "Share a vegan restaurant with the community.",
};

export default async function NewRestaurantPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/restaurants/new");
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Back link */}
      <div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          <Link href="/restaurants" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Restaurants
          </Link>
        </Button>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Add a New Restaurant</h1>
        <p className="text-gray-600">
          Share a vegan-friendly restaurant with the community and help others discover great
          places.
        </p>
      </div>

      <RestaurantFormClient />
    </div>
  );
}
