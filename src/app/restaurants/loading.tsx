import { Skeleton } from "@/components/ui/skeleton";

function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Image placeholder */}
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-4">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        {/* Rating row */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        {/* Address line 1 */}
        <Skeleton className="h-4 w-full" />
        {/* Address line 2 */}
        <Skeleton className="h-4 w-2/3" />
        {/* Tag pills */}
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function RestaurantsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button skeleton */}
      <Skeleton className="mb-6 h-9 w-32 rounded-md" />

      {/* Hero title */}
      <div className="mb-8 space-y-3 text-center">
        <Skeleton className="mx-auto h-10 w-2/3 max-w-lg" />
        <Skeleton className="mx-auto h-5 w-full max-w-2xl" />
        <Skeleton className="mx-auto h-5 w-3/4 max-w-xl" />
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>

      {/* Section heading */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      {/* Restaurant grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <RestaurantCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
