import { Skeleton } from "@/components/ui/skeleton";

function BusinessCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      {/* Image placeholder */}
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-4">
        {/* Business name */}
        <Skeleton className="h-5 w-2/3" />
        {/* Category badge */}
        <Skeleton className="h-6 w-28 rounded-full" />
        {/* Description lines */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        {/* Location */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-48" />
        </div>
        {/* CTA button */}
        <Skeleton className="mt-2 h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

export default function BusinessesLoading() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Back button */}
      <Skeleton className="h-9 w-36 rounded-md" />

      {/* Filter / search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Business grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <BusinessCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
