"use client";

import { useState, useEffect, useCallback } from "react";
import { Doctor, getDoctors } from "@/lib/api/doctors";
import { DoctorCard } from "./doctor-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User } from "lucide-react";
import { toast } from "sonner";

interface SimpleDoctorListProps {
  initialDoctors?: Doctor[];
  showFilters?: boolean;
  title?: string;
}

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

export function SimpleDoctorList({
  initialDoctors = [],
  showFilters = true,
  title = "Doctors",
}: SimpleDoctorListProps) {
  const [mounted, setMounted] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>(
    Array.isArray(initialDoctors) ? initialDoctors : []
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDoctors = useCallback(
    async (isLoadMore = false) => {
      if (!mounted) return;

      console.log("Fetching doctors with filters:", {
        search: search.trim(),
        specialty: specialtyFilter,
        rating: ratingFilter ? parseInt(ratingFilter) : undefined,
        location: locationFilter.trim(),
        page: isLoadMore ? page + 1 : 1,
        limit: 12,
      });

      try {
        setLoading(true);
        const filters = {
          search: search.trim(),
          specialty: specialtyFilter,
          rating: ratingFilter ? parseInt(ratingFilter) : undefined,
          location: locationFilter.trim(),
          page: isLoadMore ? page + 1 : 1,
          limit: 12,
        };

        const response = await getDoctors(filters);
        console.log("getDoctors response:", response);

        // Extract doctors from backend response format {success: true, data: [...]}
        const doctorsData = Array.isArray(response) ? response : response?.data || [];
        console.log("Processed doctors data:", doctorsData);

        if (isLoadMore) {
          setDoctors((prev) => [...(Array.isArray(prev) ? prev : []), ...doctorsData]);
          setPage((prev) => prev + 1);
        } else {
          setDoctors(doctorsData);
          setPage(1);
        }

        setHasMore(doctorsData.length === 12);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        toast.error("Failed to load doctors");
        // Ensure doctors is always an array on error
        if (!isLoadMore) {
          setDoctors([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [mounted, search, specialtyFilter, ratingFilter, locationFilter, page]
  );

  useEffect(() => {
    if (mounted && initialDoctors.length === 0) {
      fetchDoctors();
    }
  }, [mounted, fetchDoctors, initialDoctors.length]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSpecialtyChange = (value: string) => {
    setSpecialtyFilter(value);
    setPage(1);
  };

  const handleRatingChange = (value: string) => {
    setRatingFilter(value);
    setPage(1);
  };

  const handleLocationChange = (value: string) => {
    setLocationFilter(value);
    setPage(1);
  };

  const handleLoadMore = () => {
    fetchDoctors(true);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="h-10 animate-pulse rounded bg-gray-200" />
                <div className="h-10 animate-pulse rounded bg-gray-200" />
                <div className="h-10 animate-pulse rounded bg-gray-200" />
                <div className="h-10 animate-pulse rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[320px] animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}

      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search doctors..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Specialty Filter */}
              <select
                value={specialtyFilter}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
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
                onChange={(e) => handleRatingChange(e.target.value)}
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
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Location..."
                  value={locationFilter}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && doctors.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[320px] animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      ) : !doctors || !Array.isArray(doctors) || doctors.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-gray-500">No doctors found.</p>
          <p className="text-gray-400">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors &&
              Array.isArray(doctors) &&
              doctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                variant="outline"
                className="min-w-[200px]"
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
