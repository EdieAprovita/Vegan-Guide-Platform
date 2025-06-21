"use client";

import { useState, useEffect, useCallback } from "react";
import { Post, getPosts } from "@/lib/api/posts";
import { PostCard } from "./post-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface PostListProps {
  initialPosts?: Post[];
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
  "Other"
];

export function PostList({ 
  initialPosts = [], 
  showFilters = true,
  title = "Community Posts"
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 12,
      };

      if (search) params.search = search;
      if (tagFilter) params.tags = tagFilter;

      const response = await getPosts(params);
      
      if (reset) {
        setPosts(response.posts || response);
        setPage(1);
      } else {
        setPosts(prev => [...prev, ...(response.posts || response)]);
      }

      setHasMore((response.posts || response).length === 12);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [page, search, tagFilter]);

  useEffect(() => {
    if (initialPosts.length === 0) {
      loadPosts(true);
    }
  }, [initialPosts.length, loadPosts]);

  const handleSearch = () => {
    loadPosts(true);
  };

  const handleFilterChange = () => {
    loadPosts(true);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Sort posts locally
    const sortedPosts = [...posts];
    switch (value) {
      case "recent":
        sortedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "popular":
        sortedPosts.sort((a, b) => b.likes.length - a.likes.length);
        break;
      case "comments":
        sortedPosts.sort((a, b) => b.comments.length - a.comments.length);
        break;
    }
    setPosts(sortedPosts);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadPosts(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">
          {posts.length} posts found
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
                  placeholder="Search posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Tag Filter */}
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  handleFilterChange();
                }}
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
                onChange={(e) => handleSortChange(e.target.value)}
                className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Sort by</option>
                <option value="recent">Most Recent</option>
                <option value="popular">Most Liked</option>
                <option value="comments">Most Comments</option>
              </select>

              {/* Search Button */}
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onLikeChange={() => loadPosts(true)} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or be the first to create a post!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {hasMore && posts.length > 0 && (
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