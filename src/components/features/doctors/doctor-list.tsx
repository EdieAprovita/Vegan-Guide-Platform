"use client";

import { useState, useEffect, useCallback } from "react";
import { Doctor, getDoctors } from "@/lib/api/doctors";
import { DoctorCard } from "./doctor-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User } from "lucide-react";
import { toast } from "sonner";

interface DoctorListProps {
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
  "Other"
];

const RATING_OPTIONS = [
  { value: "0", label: "Any rating" },
  { value: "4", label: "4+ stars" },
  { value: "3", label: "3+ stars" },
  { value: "2", label: "2+ stars" },
];

export function DoctorList({ 
  initialDoctors = [], 
  showFilters = true,
  title = "Doctors"
}: DoctorListProps) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadDoctors = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 12,
      };

      if (search) params.search = search;
      if (specialtyFilter) params.specialty = specialtyFilter;
      if (ratingFilter) params.rating = parseInt(ratingFilter);

      const response = await getDoctors(params);
      
      if (reset) {
        setDoctors(response.doctors || response);
        setPage(1);
      } else {
        setDoctors(prev => [...prev, ...(response.doctors || response)]);
      }

      setHasMore((response.doctors || response).length === 12);
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, [page, search, specialtyFilter, ratingFilter]);

  useEffect(() => {
    if (initialDoctors.length === 0) {
      loadDoctors(true);
    }
  }, [initialDoctors.length, loadDoctors]);

  const handleSearch = () => {
    loadDoctors(true);
  };

  const handleFilterChange = () => {
    loadDoctors(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadDoctors(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">
          {doctors.length} doctors found
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search doctors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Specialty Filter */}
              <Select value={specialtyFilter} onValueChange={(value) => {
                setSpecialtyFilter(value);
                handleFilterChange();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All specialties</SelectItem>
                  {SPECIALTY_OPTIONS.map((specialty) => (
                    <SelectItem key={specialty} value={specialty.toLowerCase()}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select value={ratingFilter} onValueChange={(value) => {
                setRatingFilter(value);
                handleFilterChange();
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Grid */}
      {doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {hasMore && doctors.length > 0 && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            disabled={loading}
            variant="outline"
            className="px-8"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
} 