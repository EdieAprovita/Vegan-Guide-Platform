import { Skeleton } from "@/components/ui/skeleton";

function LocationCardSkeleton() {
  return (
    <div className="border-b border-gray-100 py-3 space-y-1.5 last:border-b-0">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3.5 w-24" />
    </div>
  );
}

export default function MapLoading() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="z-10 w-1/3 shrink-0 overflow-y-auto bg-white p-4 shadow-lg space-y-4">
        {/* Title */}
        <Skeleton className="h-7 w-24" />

        {/* Search input */}
        <Skeleton className="h-10 w-full rounded-md" />

        {/* Filters heading + checkboxes */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <div className="space-y-2 pl-1">
            {["Restaurantes", "Mercados", "Doctores"].map((label) => (
              <div key={label} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Location list */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <LocationCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Map area — full remaining width */}
      <div className="relative flex-1">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />

        {/* Simulated map controls top-right */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Simulated map attribution bottom */}
        <div className="absolute bottom-3 right-3">
          <Skeleton className="h-4 w-40 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
