import { getMarkets, Market } from "@/lib/api/markets";
import { SimpleMarketList } from "@/components/features/markets/simple-market-list";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function MarketsPage() {
  let initialMarkets: Market[] = [];

  try {
    const response = await getMarkets();
    // Ensure we always pass an array
    initialMarkets = Array.isArray(response) ? response : response?.data || [];
    console.log("Server-side markets fetch result:", initialMarkets);
  } catch (error) {
    console.error("Failed to fetch markets:", error);
    // Continue with empty array, the client-side will handle the loading
    initialMarkets = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Find Vegan Markets</h1>
            <p className="text-gray-600">
              Discover local markets and stores with fresh vegan products
            </p>
          </div>
          <Button asChild>
            <Link href="/markets/new">
              <Plus className="mr-2 h-4 w-4" />
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
