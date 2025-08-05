import { getMarkets } from "@/lib/api/markets";
import { SimpleMarketList } from "@/components/features/markets/simple-market-list";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function MarketsPage() {
  let initialMarkets = [];
  
  try {
    const response = await getMarkets();
    // Ensure we always pass an array
    initialMarkets = Array.isArray(response) ? response : (response?.markets || []);
    console.log("Server-side markets fetch result:", initialMarkets);
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    // Continue with empty array, the client-side will handle the loading
    initialMarkets = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button asChild variant="outline" size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Vegan Markets
            </h1>
            <p className="text-gray-600">
              Discover local markets and stores with fresh vegan products
            </p>
          </div>
          <Button asChild>
            <Link href="/markets/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Market
            </Link>
          </Button>
        </div>

        {/* Market List */}
        <SimpleMarketList initialMarkets={initialMarkets} />
      </div>
    </div>
  );
} 