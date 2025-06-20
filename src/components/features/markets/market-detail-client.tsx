"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getMarket, addMarketReview } from "@/lib/api/markets";
import { Market } from "@/types";
import { ReviewSystem } from "@/components/features/reviews/review-system";
import { MapPin, Phone, Globe, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { notFound } from "next/navigation";

interface MarketDetailClientProps {
  marketId: string;
}

export function MarketDetailClient({ marketId }: MarketDetailClientProps) {
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarket = async () => {
      try {
        const data = await getMarket(marketId);
        setMarket(data);
      } catch {
        toast.error("Failed to load market details");
        setMarket(null);
      } finally {
        setLoading(false);
      }
    };

    if (marketId) {
      loadMarket();
    }
  }, [marketId]);

  const handleAddReview = async (rating: number, comment: string) => {
    try {
      await addMarketReview(marketId, { rating, comment });
      toast.success("Review added successfully");
      const data = await getMarket(marketId);
      setMarket(data);
    } catch {
      toast.error("Failed to add review");
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 animate-pulse">Loading...</div>;
  }

  if (!market) {
    return notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </button>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <Image
                src={market.image || "/placeholder-market.jpg"}
                alt={`Photo of ${market.name}`}
                width={300}
                height={300}
                className="h-full w-full object-cover md:w-64"
              />
            </div>
            <div className="p-8">
              <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                {market.category}
              </div>
              <h1 className="block mt-1 text-2xl leading-tight font-bold text-black">
                {market.name}
              </h1>
              <div className="mt-4">
                <p className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {market.address}, {market.city}, {market.country}
                </p>
                {market.phone && (
                  <p className="flex items-center text-gray-600 mt-2">
                    <Phone className="w-4 h-4 mr-2" />
                    {market.phone}
                  </p>
                )}
                {market.website && (
                  <a
                    href={market.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 hover:text-indigo-800 mt-2"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Visit website
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="p-8 border-t border-gray-200">
            <ReviewSystem
              itemType="Market"
              reviews={market.reviews}
              averageRating={market.rating}
              numReviews={market.numReviews}
              onReviewSubmit={handleAddReview}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 