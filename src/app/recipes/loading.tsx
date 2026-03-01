import { Skeleton } from "@/components/ui/skeleton";

function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Image placeholder */}
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-4">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        {/* Meta row: time + difficulty */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        {/* Category pill */}
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function RecipesLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-screen-2xl space-y-6">
        {/* Back button skeleton */}
        <Skeleton className="h-9 w-32 rounded-md" />

        {/* Hero title */}
        <div className="space-y-3 text-center">
          <Skeleton className="mx-auto h-12 w-1/2 max-w-md" />
          <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
          <Skeleton className="mx-auto h-5 w-3/4 max-w-xl" />
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>

        {/* Results count */}
        <Skeleton className="h-4 w-36" />

        {/* Recipe grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>
      </div>
    </main>
  );
}
