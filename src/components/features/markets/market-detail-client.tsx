"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getMarket, addMarketReview, Market } from "@/lib/api/markets";
import { Review } from "@/lib/api/reviews";
import { extractBackendData } from "@/lib/api/config";
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
        const response = await getMarket(marketId);
        setMarket(extractBackendData(response));
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

  const handleAddReview = async (data: { rating: number; comment: string }) => {
    try {
      await addMarketReview(marketId, { rating: data.rating, comment: data.comment });
      toast.success("Review added successfully");
      const response = await getMarket(marketId);
      setMarket(extractBackendData(response));
    } catch {
      toast.error("Failed to add review");
    }
  };

  if (loading) {
    return <div className="container mx-auto animate-pulse px-4 py-8">Loading...</div>;
  }

  if (!market) {
    return notFound();
  }

  // Convert market reviews to Review format
  const adaptedReviews: Review[] =
    market.reviews?.map(
      (review: { user: string; rating: number; comment: string; date: string }, index: number) => ({
        _id: `${market._id}-${index}`,
        user: {
          _id: `user-${review.user}`,
          username: review.user,
          photo: undefined,
        },
        rating: review.rating,
        comment: review.comment,
        createdAt: review.date,
        updatedAt: review.date,
        resourceType: "market" as const,
        resourceId: market._id,
        helpful: [],
        helpfulCount: 0,
      })
    ) || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Markets
        </button>
        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <Image
                src="/placeholder-market.jpg"
                alt={`Photo of ${market.marketName}`}
                width={300}
                height={300}
                className="h-full w-full object-cover md:w-64"
              />
            </div>
            <div className="p-8">
              <div className="text-sm font-semibold tracking-wide text-indigo-500 uppercase">
                Market
              </div>
              <h1 className="mt-1 block text-2xl leading-tight font-bold text-black">
                {market.marketName}
              </h1>
              <div className="mt-4">
                <p className="flex items-center text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  {market.address}
                </p>
                {market.contact && market.contact.length > 0 && market.contact[0].phone && (
                  <p className="mt-2 flex items-center text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    {market.contact[0].phone}
                  </p>
                )}
                {market.contact && market.contact.length > 0 && market.contact[0].website && (
                  <a
                    href={market.contact[0].website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center text-indigo-600 hover:text-indigo-800"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Visit website
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 p-8">
            <ReviewSystem reviews={adaptedReviews} onReviewSubmit={handleAddReview} />
          </div>
        </div>
      </div>
    </main>
  );
}
