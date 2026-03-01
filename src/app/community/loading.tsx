import { Skeleton } from "@/components/ui/skeleton";

function PostCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
      {/* Author row */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        {/* Options menu placeholder */}
        <Skeleton className="ml-auto h-8 w-8 rounded-full" />
      </div>

      {/* Post content */}
      <div className="space-y-2">
        {/* Title (not all posts have one, but skeleton is useful) */}
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Optional image placeholder (50% of posts) */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      {/* Actions row: like, comment, share */}
      <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

export default function CommunityLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main feed */}
          <div className="space-y-4 lg:col-span-2">
            {/* Sort/filter bar */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>

            {/* Posts */}
            {Array.from({ length: 4 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>

          {/* Sidebar */}
          <aside className="hidden space-y-5 lg:block">
            {/* Community stats card */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-2.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            </div>

            {/* Trending topics */}
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-3">
              <Skeleton className="h-5 w-36" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-20 rounded-full" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
