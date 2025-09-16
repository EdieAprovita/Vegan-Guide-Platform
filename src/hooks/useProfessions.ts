"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserLocation } from "@/hooks/useGeolocation";
import { processBackendResponse } from "@/lib/api/config";
import * as professionsApi from "@/lib/api/professions";
import type {
  Profession,
  ProfessionalProfile,
  CreateProfessionData,
  CreateProfessionalProfileData,
  ProfessionReview,
  ProfessionSearchParams,
  ProfessionalProfileSearchParams,
} from "@/lib/api/professions";

// Professions hooks with geolocation
export function useNearbyProfessions(params: {
  radius?: number;
  limit?: number;
  category?: string;
  rating?: number;
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: ["professions", "nearby", userCoords, params],
    queryFn: async () => {
      if (!userCoords) {
        throw new Error("Ubicación del usuario requerida");
      }

      const response = await professionsApi.getNearbyProfessions({
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        radius: params.radius || 5,
        limit: params.limit,
        category: params.category,
        rating: params.rating,
      });

      return processBackendResponse<Profession>(response) as Profession[];
    },
    enabled: !!userCoords && params.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useProfessionsByCategory(params: {
  category: string;
  includeLocation?: boolean;
  radius?: number;
  limit?: number;
  sortBy?: "professionName" | "distance" | "rating";
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: ["professions", "byCategory", params, userCoords],
    queryFn: async () => {
      const searchParams: Parameters<typeof professionsApi.getProfessionsByCategory>[0] = {
        category: params.category,
        limit: params.limit,
        sortBy: params.sortBy || "professionName",
      };

      if (params.includeLocation && userCoords) {
        searchParams.latitude = userCoords.lat;
        searchParams.longitude = userCoords.lng;
        searchParams.radius = params.radius || 10;
      }

      const response = await professionsApi.getProfessionsByCategory(searchParams);
      return processBackendResponse<Profession>(response) as Profession[];
    },
    enabled: !!params.category && params.enabled !== false,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

export function useProfessions(params?: ProfessionSearchParams & { enabled?: boolean }) {
  return useQuery({
    queryKey: ["professions", "list", params],
    queryFn: async () => {
      const response = await professionsApi.getProfessions(params);
      return processBackendResponse<Profession>(response) as Profession[];
    },
    enabled: params?.enabled !== false,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

export function useProfession(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["professions", "detail", id],
    queryFn: async () => {
      const response = await professionsApi.getProfession(id);
      return processBackendResponse<Profession>(response) as Profession;
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Professional Profiles hooks with geolocation
export function useNearbyProfessionalProfiles(params: {
  radius?: number;
  limit?: number;
  profession?: string;
  skills?: string;
  availability?: boolean;
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: ["professionalProfiles", "nearby", userCoords, params],
    queryFn: async () => {
      if (!userCoords) {
        throw new Error("Ubicación del usuario requerida");
      }

      const response = await professionsApi.getNearbyProfessionalProfiles({
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        radius: params.radius || 5,
        limit: params.limit,
        profession: params.profession,
        skills: params.skills,
        availability: params.availability,
      });

      return processBackendResponse<ProfessionalProfile>(response) as ProfessionalProfile[];
    },
    enabled: !!userCoords && params.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useAdvancedProfessionalProfileSearch(params: {
  search?: string;
  profession?: string;
  skills?: string[];
  availability?: boolean;
  includeLocation?: boolean;
  radius?: number;
  sortBy?: "user.username" | "distance" | "rates.hourly";
  limit?: number;
  page?: number;
  enabled?: boolean;
}) {
  const { userCoords } = useUserLocation();

  return useQuery({
    queryKey: ["professionalProfiles", "advancedSearch", params, userCoords],
    queryFn: async () => {
      const searchParams: Parameters<typeof professionsApi.getAdvancedProfessionalProfiles>[0] = {
        search: params.search,
        profession: params.profession,
        skills: params.skills,
        availability: params.availability,
        sortBy: params.sortBy || "user.username",
        limit: params.limit || 20,
        page: params.page || 1,
      };

      if (params.includeLocation && userCoords) {
        searchParams.latitude = userCoords.lat;
        searchParams.longitude = userCoords.lng;
        searchParams.radius = params.radius || 10;
      }

      const response = await professionsApi.getAdvancedProfessionalProfiles(searchParams);
      return processBackendResponse<ProfessionalProfile>(response) as ProfessionalProfile[];
    },
    enabled: params.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

export function useProfessionalProfiles(
  params?: ProfessionalProfileSearchParams & { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["professionalProfiles", "list", params],
    queryFn: async () => {
      const response = await professionsApi.getProfessionalProfiles(params);
      return processBackendResponse<ProfessionalProfile>(response) as ProfessionalProfile[];
    },
    enabled: params?.enabled !== false,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

export function useProfessionalProfile(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["professionalProfiles", "detail", id],
    queryFn: async () => {
      const response = await professionsApi.getProfessionalProfile(id);
      return processBackendResponse<ProfessionalProfile>(response) as ProfessionalProfile;
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Mutations for Professions and Professional Profiles
export function useProfessionMutations() {
  const queryClient = useQueryClient();

  const createProfession = useMutation({
    mutationFn: ({ data, token }: { data: CreateProfessionData; token?: string }) =>
      professionsApi.createProfession(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professions"] });
    },
  });

  const updateProfession = useMutation({
    mutationFn: ({
      id,
      data,
      token,
    }: {
      id: string;
      data: Partial<CreateProfessionData>;
      token?: string;
    }) => professionsApi.updateProfession(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professions"] });
    },
  });

  const deleteProfession = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      professionsApi.deleteProfession(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professions"] });
    },
  });

  const addProfessionReview = useMutation({
    mutationFn: ({ id, review, token }: { id: string; review: ProfessionReview; token?: string }) =>
      professionsApi.addProfessionReview(id, review, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professions"] });
    },
  });

  return {
    createProfession,
    updateProfession,
    deleteProfession,
    addProfessionReview,
  };
}

export function useProfessionalProfileMutations() {
  const queryClient = useQueryClient();

  const createProfessionalProfile = useMutation({
    mutationFn: ({ data, token }: { data: CreateProfessionalProfileData; token?: string }) =>
      professionsApi.createProfessionalProfile(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalProfiles"] });
    },
  });

  const updateProfessionalProfile = useMutation({
    mutationFn: ({
      id,
      data,
      token,
    }: {
      id: string;
      data: Partial<CreateProfessionalProfileData>;
      token?: string;
    }) => professionsApi.updateProfessionalProfile(id, data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalProfiles"] });
    },
  });

  const deleteProfessionalProfile = useMutation({
    mutationFn: ({ id, token }: { id: string; token?: string }) =>
      professionsApi.deleteProfessionalProfile(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professionalProfiles"] });
    },
  });

  return {
    createProfessionalProfile,
    updateProfessionalProfile,
    deleteProfessionalProfile,
  };
}
