"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getDoctors,
  getDoctor,
  searchDoctors,
  addDoctorReview,
  getNearbyDoctors,
  getDoctorsBySpecialty,
  getAdvancedDoctors,
  Doctor,
  DoctorSearchParams,
} from "@/lib/api/doctors";
import { processBackendResponse } from "@/lib/api/config";
import { getCurrentLocation } from "@/lib/utils/geospatial";
import { toast } from "sonner";

export function useDoctors(initialDoctors: Doctor[] = []) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getDoctors();
      const doctors = processBackendResponse<Doctor>(response) as Doctor[];
      setDoctors(Array.isArray(doctors) ? doctors : []);
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      toast.error("Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDoctorsWithParams = useCallback(async (params?: DoctorSearchParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getDoctors(params);
      const doctors = processBackendResponse<Doctor>(response) as Doctor[];
      setDoctors(Array.isArray(doctors) ? doctors : []);
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      toast.error("Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getDoctorById = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getDoctor(id);
      const doctor = processBackendResponse<Doctor>(response) as Doctor;
      setCurrentDoctor(doctor);
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      toast.error("Failed to fetch doctor details");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await searchDoctors(query);
      const doctors = processBackendResponse<Doctor>(response) as Doctor[];
      setDoctors(Array.isArray(doctors) ? doctors : []);
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      toast.error("Failed to search for doctors");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddReview = useCallback(
    async (id: string, review: { rating: number; comment: string }) => {
      try {
        await addDoctorReview(id, review);
        toast.success("Review added successfully");
        getDoctorById(id);
      } catch (err) {
        const e = err as Error;
        setError(e.message);
        toast.error("Failed to add review");
      }
    },
    [getDoctorById]
  );

  const getUserLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      return location;
    } catch (err) {
      const e = err as Error;
      setError(e.message);
      toast.error("Failed to get user location");
      throw err;
    }
  }, []);

  return {
    doctors,
    currentDoctor,
    isLoading,
    error,
    userLocation,
    fetchDoctors,
    fetchDoctorsWithParams,
    getDoctorById,
    handleSearch,
    handleAddReview,
    getUserLocation,
  };
}

export function useNearbyDoctors(radius: number = 5) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchNearbyDoctors = useCallback(
    async (params?: { specialty?: string; minRating?: number; limit?: number }) => {
      try {
        setIsLoading(true);
        setError(null);

        let location = userLocation;
        if (!location) {
          location = await getCurrentLocation();
          setUserLocation(location);
        }

        const response = await getNearbyDoctors({
          latitude: location.lat,
          longitude: location.lng,
          radius,
          ...params,
        });

        const doctors = processBackendResponse<Doctor>(response) as Doctor[];
        setDoctors(Array.isArray(doctors) ? doctors : []);
      } catch (err) {
        const e = err as Error;
        setError(e.message);
        toast.error("Failed to fetch nearby doctors");
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    },
    [radius, userLocation]
  );

  const fetchWithLocation = useCallback(
    async (
      lat: number,
      lng: number,
      params?: {
        specialty?: string;
        minRating?: number;
        limit?: number;
      }
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const location = { lat, lng };
        setUserLocation(location);

        const response = await getNearbyDoctors({
          latitude: lat,
          longitude: lng,
          radius,
          ...params,
        });

        const doctors = processBackendResponse<Doctor>(response) as Doctor[];
        setDoctors(Array.isArray(doctors) ? doctors : []);
      } catch (err) {
        const e = err as Error;
        setError(e.message);
        toast.error("Failed to fetch nearby doctors");
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    },
    [radius]
  );

  return {
    doctors,
    isLoading,
    error,
    userLocation,
    fetchNearbyDoctors,
    fetchWithLocation,
  };
}

export function useDoctorsBySpecialty(specialty: string) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchDoctorsBySpecialty = useCallback(
    async (params?: { page?: number; limit?: number; useLocation?: boolean; radius?: number }) => {
      try {
        setIsLoading(true);
        setError(null);

        let apiParams: any = {
          page: params?.page,
          limit: params?.limit,
        };

        if (params?.useLocation) {
          let location = userLocation;
          if (!location) {
            location = await getCurrentLocation();
            setUserLocation(location);
          }
          apiParams.latitude = location.lat;
          apiParams.longitude = location.lng;
          apiParams.radius = params.radius || 10;
        }

        const response = await getDoctorsBySpecialty(specialty, apiParams);
        const doctors = processBackendResponse<Doctor>(response) as Doctor[];
        setDoctors(Array.isArray(doctors) ? doctors : []);
      } catch (err) {
        const e = err as Error;
        setError(e.message);
        toast.error(`Failed to fetch ${specialty} doctors`);
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    },
    [specialty, userLocation]
  );

  useEffect(() => {
    if (specialty) {
      fetchDoctorsBySpecialty();
    }
  }, [specialty, fetchDoctorsBySpecialty]);

  return {
    doctors,
    isLoading,
    error,
    userLocation,
    fetchDoctorsBySpecialty,
  };
}

export function useAdvancedDoctorSearch() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const searchDoctors = useCallback(
    async (params: {
      page?: number;
      limit?: number;
      search?: string;
      specialty?: string;
      minRating?: number;
      languages?: string[];
      useLocation?: boolean;
      radius?: number;
      sortBy?: "distance" | "rating" | "name" | "createdAt";
      append?: boolean;
    }) => {
      try {
        setIsLoading(true);
        if (!params.append) {
          setError(null);
        }

        let apiParams: any = {
          page: params.page || 1,
          limit: params.limit || 12,
          search: params.search,
          specialty: params.specialty,
          minRating: params.minRating,
          languages: params.languages,
          sortBy: params.sortBy,
        };

        if (params.useLocation) {
          let location = userLocation;
          if (!location) {
            location = await getCurrentLocation();
            setUserLocation(location);
          }
          apiParams.latitude = location.lat;
          apiParams.longitude = location.lng;
          apiParams.radius = params.radius || 10;
        }

        const response = await getAdvancedDoctors(apiParams);
        const newDoctors = processBackendResponse<Doctor>(response) as Doctor[];

        if (params.append) {
          setDoctors((prev) => [...prev, ...(Array.isArray(newDoctors) ? newDoctors : [])]);
        } else {
          setDoctors(Array.isArray(newDoctors) ? newDoctors : []);
        }

        const hasMoreResults =
          Array.isArray(newDoctors) && newDoctors.length === (params.limit || 12);
        setHasMore(hasMoreResults);
        setCurrentPage(params.page || 1);
      } catch (err) {
        const e = err as Error;
        setError(e.message);
        toast.error("Failed to search doctors");
        if (!params.append) {
          setDoctors([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userLocation]
  );

  const loadMore = useCallback(
    async (params: {
      search?: string;
      specialty?: string;
      minRating?: number;
      languages?: string[];
      useLocation?: boolean;
      radius?: number;
      sortBy?: "distance" | "rating" | "name" | "createdAt";
    }) => {
      if (hasMore && !isLoading) {
        await searchDoctors({
          ...params,
          page: currentPage + 1,
          append: true,
        });
      }
    },
    [hasMore, isLoading, currentPage, searchDoctors]
  );

  const clearResults = useCallback(() => {
    setDoctors([]);
    setError(null);
    setHasMore(true);
    setCurrentPage(1);
  }, []);

  return {
    doctors,
    isLoading,
    error,
    userLocation,
    hasMore,
    currentPage,
    searchDoctors,
    loadMore,
    clearResults,
  };
}
