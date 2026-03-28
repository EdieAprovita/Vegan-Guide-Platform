"use client";

import { useState } from "react";
import { useMarkets } from "@/hooks/useMarkets";
import { MarketCard } from "./market-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Store } from "lucide-react";

interface SimpleMarketListProps {
  showFilters?: boolean;
  title?: string;
}

const PAGE_LIMIT = 12;

const PRODUCT_OPTIONS = [
  "Organic Vegetables",
  "Fresh Fruits",
  "Plant-based Proteins",
  "Dairy Alternatives",
  "Grains & Legumes",
  "Nuts & Seeds",
  "Herbs & Spices",
  "Bakery",
  "Beverages",
  "Supplements",
  "Other",
];

const RATING_OPTIONS = [
  { value: "0", label: "Any rating" },
  { value: "4", label: "4+ stars" },
  { value: "3", label: "3+ stars" },
  { value: "2", label: "2+ stars" },
];

export function SimpleMarketList({ showFilters = true, title = "Markets" }: SimpleMarketListProps) {
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: markets = [],
    isLoading,
    isFetching,
  } = useMarkets({
    search: search.trim() || undefined,
    products: productFilter || undefined,
    rating: ratingFilter ? parseInt(ratingFilter) : undefined,
    location: locationFilter.trim() || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  const hasMore = markets.length === PAGE_LIMIT;

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {title && <h2 className="text-foreground text-2xl font-bold">{title}</h2>}

      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search markets..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>

              {/* Product Filter */}
              <select
                value={productFilter}
                onChange={(e) => {
                  setProductFilter(e.target.value);
                  setPage(1);
                }}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                <option value="">All Products</option>
                {PRODUCT_OPTIONS.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                {RATING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Location Filter */}
              <div className="relative">
                <Store className="text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && markets.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-[320px] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : markets.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">No markets found.</p>
          <p className="text-muted-foreground/60">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {markets.map((market) => (
              <MarketCard key={market._id} market={market} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isFetching}
                variant="outline"
                className="min-w-[200px]"
              >
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
