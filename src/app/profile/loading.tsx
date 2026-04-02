import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Avatar + basic info — centered block */}
        <div className="flex flex-col items-center gap-4">
          {/* Large avatar circle */}
          <Skeleton className="h-28 w-28 rounded-full" />
          {/* Name */}
          <Skeleton className="h-7 w-48" />
          {/* Email */}
          <Skeleton className="h-4 w-60" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>

        {/* Bio / description section */}
        <div className="space-y-3 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Form fields section */}
        <div className="space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <Skeleton className="h-5 w-40" />
          {/* Two-column field grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          {/* Full-width field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
          {/* Save button */}
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>
    </div>
  );
}
