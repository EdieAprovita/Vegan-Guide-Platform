import { MarketList } from "@/components/features/markets/market-list";
import { Button } from "@/components/ui/button";
import { Plus, Store } from "lucide-react";
import Link from "next/link";

export default function MarketsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
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
        <MarketList />
      </div>
    </div>
  );
} 