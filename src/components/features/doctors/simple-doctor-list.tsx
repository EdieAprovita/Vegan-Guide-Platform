"use client";

import { useState, useEffect } from "react";
import { useDoctors } from "@/hooks/useDoctors";
import type { Doctor } from "@/lib/api/doctors";
import { DoctorCard } from "./doctor-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User } from "lucide-react";

interface SimpleDoctorListProps {
  showFilters?: boolean;
  title?: string;
}

const PAGE_LIMIT = 12;

const SPECIALTY_OPTIONS = [
  "Nutritionist",
  "General Practitioner",
  "Cardiologist",
  "Endocrinologist",
  "Gastroenterologist",
  "Dermatologist",
  "Pediatrician",
  "Psychiatrist",
  "Alternative Medicine",
  "Holistic Medicine",
  "Other",
];

const RATING_OPTIONS = [
  { value: "0", label: "Any rating" },
  { value: "4", label: "4+ stars" },
  { value: "3", label: "3+ stars" },
  { value: "2", label: "2+ stars" },
];

export function SimpleDoctorList({ showFilters = true, title = "Doctors" }: SimpleDoctorListProps) {
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);

  const {
    data: doctors = [],
    isLoading,
    isFetching,
  } = useDoctors({
    search: search.trim() || undefined,
    specialty: specialtyFilter || undefined,
    rating: ratingFilter ? parseInt(ratingFilter) : undefined,
    location: locationFilter.trim() || undefined,
    page,
    limit: PAGE_LIMIT,
  });

  // Accumulate results — reset on page 1 (filter/search change), append on subsequent pages
  useEffect(() => {
    if (doctors.length > 0 || page === 1) {
      setAllDoctors((prev) => {
        if (page === 1) return doctors;
        const existingIds = new Set(prev.map((d) => d._id));
        const newItems = doctors.filter((d) => !existingIds.has(d._id));
        return [...prev, ...newItems];
      });
    }
  }, [doctors, page]);

  // Reset accumulated list whenever filters change
  useEffect(() => {
    setPage(1);
    setAllDoctors([]);
  }, [search, specialtyFilter, ratingFilter, locationFilter]);

  const hasMore = doctors.length === PAGE_LIMIT;

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {title && <h2 className="text-foreground text-2xl font-bold">{title}</h2>}

      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Search doctors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Specialty Filter */}
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                <option value="">All Specialties</option>
                {SPECIALTY_OPTIONS.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
              >
                {RATING_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Location Filter */}
              <div className="relative">
                <User className="text-muted-foreground/60 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && allDoctors.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-[320px] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : allDoctors.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">No doctors found.</p>
          <p className="text-muted-foreground/60">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allDoctors.map((doctor) => (
              <DoctorCard key={doctor._id} doctor={doctor} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={isFetching}
                variant="outline"
                className="min-w-[200px]"
              >
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
