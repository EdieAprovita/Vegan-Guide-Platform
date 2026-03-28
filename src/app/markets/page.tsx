import { Metadata } from "next";
import { SimpleMarketList } from "@/components/features/markets/simple-market-list";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mercados Veganos | Verde Guide",
  description:
    "Descubre mercados orgánicos y tiendas locales con productos veganos frescos cerca de ti. Encuentra los mejores mercados plant-based de tu ciudad.",
  keywords: [
    "mercados veganos",
    "mercados orgánicos",
    "tiendas veganas",
    "productos veganos",
    "alimentación plant-based",
    "compras veganas",
  ],
  openGraph: {
    title: "Mercados Veganos | Verde Guide",
    description:
      "Descubre mercados orgánicos y tiendas locales con productos veganos frescos cerca de ti.",
  },
};

// Re-generate the page at most once per hour (ISR)
export const revalidate = 3600;

export default async function MarketsPage() {
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
        <SimpleMarketList />
      </div>
    </div>
  );
}
