"use client";

import { useState, useEffect } from "react";
import { Market, getMarkets } from "@/lib/api/markets";
import { MarketCard } from "./market-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Store } from "lucide-react";
import { toast } from "sonner";

interface MarketListProps {
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

export function MarketList({ 
  initialMarkets = [], 
  showFilters = true,
  title = "Markets"
}: MarketListProps) {
  const [markets, setMarkets] = useState<Market[]>(initialMarkets);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMarkets = async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const params: any = {
        page: currentPage,
        limit: 12,
      };

      if (search) params.search = search;
      if (productFilter) params.products = productFilter;
      if (ratingFilter) params.rating = parseInt(ratingFilter);

      const response = await getMarkets(params);
      
      if (reset) {
        setMarkets(response.markets || response);
        setPage(1);
      } else {
        setMarkets(prev => [...prev, ...(response.markets || response)]);
      }

      setHasMore((response.markets || response).length === 12);
    } catch (error) {
      toast.error("Failed to load markets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialMarkets.length === 0) {
      loadMarkets(true);
    }
  }, []);

  const handleSearch = () => {
    loadMarkets(true);
  };

  const handleFilterChange = () => {
    loadMarkets(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadMarkets(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">
          {markets.length} markets found
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search markets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Product Filter */}
              <Select value={productFilter} onValueChange={(value) => {
                setProductFilter(value);
                handleFilterChange();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All products</SelectItem>
                  {PRODUCT_OPTIONS.map((product) => (
                    <SelectItem key={product} value={product.toLowerCase()}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select value={ratingFilter} onValueChange={(value) => {
                setRatingFilter(value);
                handleFilterChange();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Grid */}
      {markets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <MarketCard key={market._id} market={market} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No markets found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {hasMore && markets.length > 0 && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            className="px-8"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
} 