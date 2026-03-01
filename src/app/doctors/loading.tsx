import { Skeleton } from "@/components/ui/skeleton";

function DoctorCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      {/* Avatar circle */}
      <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2.5">
        {/* Name */}
        <Skeleton className="h-5 w-44" />
        {/* Specialty */}
        <Skeleton className="h-4 w-36" />
        {/* Rating row */}
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3.5 w-3.5 rounded-sm" />
            ))}
          </div>
          <Skeleton className="h-4 w-10" />
        </div>
        {/* Location */}
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        {/* Tags */}
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function DoctorsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Back button */}
        <Skeleton className="mb-6 h-9 w-32 rounded-md" />

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        {/* Filter bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </div>

        {/* Doctor cards — list layout matching the actual page */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
