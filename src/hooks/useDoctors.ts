"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDoctors,
  getDoctor,
  getNearbyDoctors,
  getDoctorsBySpecialty,
  getAdvancedDoctors,
  addDoctorReview,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  Doctor,
  DoctorSearchParams,
  DoctorReview,
  CreateDoctorData,
} from "@/lib/api/doctors";
import { processBackendResponse } from "@/lib/api/config";
import { useUserLocation } from "@/hooks/useGeolocation";
import { queryKeys } from "@/lib/api/queryKeys";

// Base list query
export function useDoctors(params?: DoctorSearchParams) {
  return useQuery({
    queryKey: queryKeys.doctors.list(params as Record<string, unknown>),
    queryFn: async () => {
      const response = await getDoctors(params);
      const data = processBackendResponse<Doctor>(response);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Single doctor query
export function useDoctor(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: async () => {
      const response = await getDoctor(id);
      return processBackendResponse<Doctor>(response) as Doctor;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Nearby doctors query
export function useNearbyDoctors(params?: {
  radius?: number;
  limit?: number;
  specialty?: string;
  minRating?: number;
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: queryKeys.doctors.nearby(userCoords, params as Record<string, unknown>),
    queryFn: async () => {
      const response = await getNearbyDoctors({
        latitude: userCoords!.lat,
        longitude: userCoords!.lng,
        radius: params?.radius || 5,
        limit: params?.limit || 20,
        specialty: params?.specialty,
        minRating: params?.minRating,
      });

      return processBackendResponse<Doctor>(response) as Doctor[];
    },
    enabled: params?.enabled !== false && !!userCoords,
    staleTime: 5 * 60 * 1000,
  });
}

// Doctors by specialty query
export function useDoctorsBySpecialty(
  specialty: string,
  params?: {
    page?: number;
    limit?: number;
    includeLocation?: boolean;
    radius?: number;
    enabled?: boolean;
  },
) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: queryKeys.doctors.bySpecialty(
      specialty,
      userCoords,
      params as Record<string, unknown>,
    ),
    queryFn: async () => {
      const apiParams: Parameters<typeof getDoctorsBySpecialty>[1] = {
        page: params?.page,
        limit: params?.limit,
      };

      if (params?.includeLocation && userCoords) {
        apiParams.latitude = userCoords.lat;
        apiParams.longitude = userCoords.lng;
        apiParams.radius = params.radius || 10;
      }

      const response = await getDoctorsBySpecialty(specialty, apiParams);
      return processBackendResponse<Doctor>(response) as Doctor[];
    },
    enabled: params?.enabled !== false && !!specialty,
    staleTime: 10 * 60 * 1000,
  });
}

// Advanced doctor search query
export function useAdvancedDoctorSearch(params: {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  minRating?: number;
  languages?: string[];
  radius?: number;
  sortBy?: "distance" | "rating" | "name" | "createdAt";
  includeLocation?: boolean;
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: queryKeys.doctors.search(userCoords, params as Record<string, unknown>),
    queryFn: async () => {
      const apiParams: Parameters<typeof getAdvancedDoctors>[0] = {
        page: params.page || 1,
        limit: params.limit || 12,
        search: params.search,
        specialty: params.specialty,
        minRating: params.minRating,
        languages: params.languages,
        sortBy: params.sortBy,
      };

      if (params.includeLocation && userCoords) {
        apiParams.latitude = userCoords.lat;
        apiParams.longitude = userCoords.lng;
        apiParams.radius = params.radius || 10;
      }

      const response = await getAdvancedDoctors(apiParams);
      return processBackendResponse<Doctor>(response) as Doctor[];
    },
    enabled: params.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

// Mutations with automatic cache invalidation
export function useDoctorMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: ({ data }: { data: CreateDoctorData }) => createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.nearby() });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.bySpecialty("") });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.search() });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDoctorData> }) =>
      updateDoctor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.detail(variables.id) });
    },
  });

  const remove = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.nearby() });
    },
  });

  const addReview = useMutation({
    mutationFn: ({ id, review }: { id: string; review: DoctorReview }) =>
      addDoctorReview(id, review),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.doctors.all });
    },
  });

  return { create, update, remove, addReview };
}
