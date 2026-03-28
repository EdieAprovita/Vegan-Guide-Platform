"use client";

import { useState } from "react";
import { useDoctors } from "@/hooks/useDoctors";
import { DoctorCard } from "./doctor-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User } from "lucide-react";

interface DoctorListProps {
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

export function DoctorList({ showFilters = true, title = "Doctors" }: DoctorListProps) {
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: doctors = [],
    isLoading,
    isFetching,
  } = useDoctors({
    search: search || undefined,
    specialty: specialtyFilter || undefined,
    rating: ratingFilter ? parseInt(ratingFilter) : undefined,
    page,
    limit: 12,
  });

  const hasMore = doctors.length === 12;

  const handleSearch = () => {
    setPage(1);
  };

  const handleLoadMore = () => {
    if (isFetching || !hasMore) return;
    setPage((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">{doctors.length} doctors found</div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search doctors..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>

              {/* Specialty Filter */}
              <Select
                value={specialtyFilter}
                onValueChange={(value) => {
                  setSpecialtyFilter(value);
                  setPage(1);
                }}
              >
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
              <Select
                value={ratingFilter}
                onValueChange={(value) => {
                  setRatingFilter(value);
                  setPage(1);
                }}
              >
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
              <Button onClick={handleSearch} disabled={isFetching}>
                {isFetching ? "Searching..." : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Grid */}
      {isLoading && doctors.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-[300px] animate-pulse rounded-lg" />
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">No doctors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </CardContent>
        </Card>
      )}

      {/* Load More Button */}
      {hasMore && doctors.length > 0 && (
        <div className="text-center">
          <Button onClick={handleLoadMore} disabled={isFetching} variant="outline" className="px-8">
            {isFetching ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
