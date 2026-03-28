"use client";

import { useState, useMemo, useEffect } from "react";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from "@/lib/api/posts";
import { PostCard } from "./post-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageSquare } from "lucide-react";

interface PostListProps {
  showFilters?: boolean;
  title?: string;
}

const TAG_OPTIONS = [
  "Vegan Lifestyle",
  "Recipes",
  "Health & Nutrition",
  "Restaurant Reviews",
  "Product Reviews",
  "Tips & Advice",
  "Community",
  "Events",
  "Environmental",
  "Animal Rights",
  "Other",
];

const PAGE_LIMIT = 12;

export function PostList({ showFilters = true, title = "Community Posts" }: PostListProps) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [allRawPosts, setAllRawPosts] = useState<Post[]>([]);

  const {
    data: rawPosts = [],
    isLoading,
    isFetching,
    refetch,
  } = usePosts({
    search: search || undefined,
    tags: tagFilter || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  // Accumulate results — reset on page 1 (filter/search change), append on subsequent pages
  useEffect(() => {
    if (rawPosts.length > 0 || page === 1) {
      setAllRawPosts((prev) => {
        if (page === 1) return rawPosts;
        const existingIds = new Set(prev.map((p) => p._id));
        const newItems = rawPosts.filter((p) => !existingIds.has(p._id));
        return [...prev, ...newItems];
      });
    }
  }, [rawPosts, page]);

  // Reset accumulated list whenever filters change
  useEffect(() => {
    setPage(1);
    setAllRawPosts([]);
  }, [search, tagFilter]);

  // Sort accumulated posts client-side
  const posts = useMemo(() => {
    const sorted = [...allRawPosts];
    switch (sortBy) {
      case "popular":
        return sorted.sort((a, b) => b.likes.length - a.likes.length);
      case "comments":
        return sorted.sort((a, b) => b.comments.length - a.comments.length);
      default:
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [allRawPosts, sortBy]);

  const hasMore = rawPosts.length === PAGE_LIMIT;

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">{posts.length} posts found</div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tag Filter */}
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                <option value="">All tags</option>
                {TAG_OPTIONS.map((tag) => (
                  <option key={tag} value={tag.toLowerCase()}>
                    {tag}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                <option value="">Sort by</option>
                <option value="recent">Most Recent</option>
                <option value="popular">Most Liked</option>
                <option value="comments">Most Comments</option>
              </select>

              {/* Search Button */}
              <Button onClick={() => setPage(1)} disabled={isFetching}>
                {isFetching ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Grid */}
      {isLoading && posts.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-[220px] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onLikeChange={() => refetch()} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No posts found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or be the first to create a post!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {hasMore && posts.length > 0 && (
        <div className="text-center">
          <Button onClick={handleLoadMore} disabled={isFetching} variant="outline" className="px-8">
            {isFetching ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
