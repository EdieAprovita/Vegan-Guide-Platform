import { Skeleton } from "@/components/ui/skeleton";

function SearchResultSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      {/* Thumbnail */}
      <Skeleton className="h-20 w-20 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2.5">
        {/* Category badge */}
        <Skeleton className="h-5 w-20 rounded-full" />
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        {/* Subtitle / meta */}
        <Skeleton className="h-4 w-1/2" />
        {/* Description */}
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto space-y-6 px-4 py-8">
        {/* Back button */}
        <Skeleton className="h-9 w-36 rounded-md" />

        {/* Page title area */}
        <div className="space-y-3 text-center">
          {/* Icon placeholder */}
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto h-10 w-72" />
          <Skeleton className="mx-auto h-5 w-full max-w-xl" />
          <Skeleton className="mx-auto h-5 w-3/4 max-w-lg" />
        </div>

        {/* Large search bar */}
        <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <Skeleton className="h-12 w-full rounded-lg" />

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>

          {/* Secondary filters row */}
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>

        {/* Results section */}
        <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          {/* Results count */}
          <Skeleton className="h-4 w-40" />
          {/* Result items */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SearchResultSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Tips panel */}
        <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-52" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
