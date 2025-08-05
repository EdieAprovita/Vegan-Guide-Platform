"use client";

import { useState, useEffect, useCallback } from "react";
import { Market, getMarkets } from "@/lib/api/markets";
import { MarketCard } from "./market-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Store } from "lucide-react";
import { toast } from "sonner";

interface SimpleMarketListProps {
  initialMarkets?: Market[];
  showFilters?: boolean;
  title?: string;
}

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
  "Other"
];

const RATING_OPTIONS = [
  { value: "0", label: "Any rating" },
  { value: "4", label: "4+ stars" },
  { value: "3", label: "3+ stars" },
  { value: "2", label: "2+ stars" },
];

export function SimpleMarketList({ 
  initialMarkets = [], 
  showFilters = true,
  title = "Markets"
}: SimpleMarketListProps) {
  const [mounted, setMounted] = useState(false);
  const [markets, setMarkets] = useState<Market[]>(Array.isArray(initialMarkets) ? initialMarkets : []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMarkets = useCallback(async (isLoadMore = false) => {
    if (!mounted) return;
    
    console.log("Fetching markets with filters:", {
      search: search.trim(),
      products: productFilter,
      rating: ratingFilter ? parseInt(ratingFilter) : undefined,
      location: locationFilter.trim(),
      page: isLoadMore ? page + 1 : 1,
      limit: 12,
    });
    
    try {
      setLoading(true);
      const filters = {
        search: search.trim(),
        products: productFilter,
        rating: ratingFilter ? parseInt(ratingFilter) : undefined,
        location: locationFilter.trim(),
        page: isLoadMore ? page + 1 : 1,
        limit: 12,
      };

      const response = await getMarkets(filters);
      console.log("getMarkets response:", response);
      
      // Extract markets from backend response format {success: true, data: [...]}
      const marketsData = Array.isArray(response) ? response : (response?.data || []);
      console.log("Processed markets data:", marketsData);
      
      if (isLoadMore) {
        setMarkets(prev => [...(Array.isArray(prev) ? prev : []), ...marketsData]);
        setPage(prev => prev + 1);
      } else {
        setMarkets(marketsData);
        setPage(1);
      }
      
      setHasMore(marketsData.length === 12);
    } catch (error) {
      console.error("Error fetching markets:", error);
      toast.error("Failed to load markets");
      // Ensure markets is always an array on error
      if (!isLoadMore) {
        setMarkets([]);
      }
    } finally {
      setLoading(false);
    }
  }, [mounted, search, productFilter, ratingFilter, locationFilter, page]);

  useEffect(() => {
    if (mounted && initialMarkets.length === 0) {
      fetchMarkets();
    }
  }, [mounted, fetchMarkets, initialMarkets.length]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleProductChange = (value: string) => {
    setProductFilter(value);
    setPage(1);
  };

  const handleRatingChange = (value: string) => {
    setRatingFilter(value);
    setPage(1);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    setPage(1);
  };

  const handleLoadMore = () => {
    fetchMarkets(true);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[320px] bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      )}

      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search markets..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Product Filter */}
              <select
                value={productFilter}
                onChange={(e) => handleProductChange(e.target.value)}
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
                onChange={(e) => handleRatingChange(e.target.value)}
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {RATING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Location Filter */}
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && markets.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[320px] bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !markets || !Array.isArray(markets) || markets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No markets found.</p>
          <p className="text-gray-400">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets && Array.isArray(markets) && markets.map((market) => (
              <MarketCard key={market._id} market={market} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
                className="min-w-[200px]"
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
