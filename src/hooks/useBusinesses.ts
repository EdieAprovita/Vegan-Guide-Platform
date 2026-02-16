"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/lib/store/auth";
import { useUserLocation } from "./useGeolocation";
import { processBackendResponse } from "@/lib/api/config";
import {
  getBusinesses,
  getBusiness,
  getBusinessesByProximity,
  searchBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  addBusinessReview,
  Business,
  CreateBusinessData,
  BusinessReview,
  BusinessFilters,
} from "@/lib/api/businesses";

// Hook principal para listar businesses con filtros avanzados
export function useBusinesses(
  filters?: BusinessFilters & {
    useUserLocation?: boolean;
    autoFetch?: boolean;
  }
) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { userCoords } = useUserLocation();

  const autoFetch = filters?.autoFetch;

  // Stabilize filters reference by memoizing on individual primitive values.
  // This prevents unnecessary re-renders when parent passes new object reference
  // with same filter values. Dependencies list tracks primitives to catch actual changes.
  // Note: eslint-disable is intentional for this pattern; alternatives (JSON.stringify,
  // deep equality) would be more expensive and have same result.
  const stableFilters = useMemo(
    () => filters,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      filters?.page,
      filters?.limit,
      filters?.search,
      filters?.typeBusiness,
      filters?.rating,
      filters?.location,
      filters?.budget,
      filters?.lat,
      filters?.lng,
      filters?.radius,
      filters?.useUserLocation,
      autoFetch,
    ]
  );

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let params = { ...stableFilters };

      // Si se solicita usar ubicación del usuario y está disponible
      if (stableFilters?.useUserLocation && userCoords) {
        params = {
          ...params,
          lat: userCoords.lat,
          lng: userCoords.lng,
          radius: params.radius || 10, // Default 10km
        };
      }

      const response = await getBusinesses(params);

      // Use the universal backend response processor
      const businessesData = processBackendResponse<Business>(response) as Business[];

      setBusinesses(Array.isArray(businessesData) ? businessesData : []);
      setTotalCount(Array.isArray(businessesData) ? businessesData.length : 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar negocios";
      setError(errorMessage);
      console.error("Error fetching businesses:", err);
    } finally {
      setLoading(false);
    }
  }, [stableFilters, userCoords]);

  // Auto-fetch cuando cambien los filtros o la ubicación del usuario
  useEffect(() => {
    if (autoFetch !== false) {
      fetchBusinesses();
    }
  }, [fetchBusinesses, autoFetch]);

  return {
    businesses,
    loading,
    error,
    totalCount,
    refetch: fetchBusinesses,
  };
}

export function useBusiness(id?: string) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBusiness(id);
        setBusiness(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al cargar el negocio";
        setError(errorMessage);
        console.error("Error fetching business:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  return { business, loading, error };
}

// Hook para búsquedas por proximidad
export function useNearbyBusinesses(radius: number = 5) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userCoords, getCurrentPosition } = useUserLocation();

  const searchNearby = useCallback(
    async (customCoords?: { lat: number; lng: number }) => {
      const coords = customCoords || userCoords;

      if (!coords) {
        try {
          await getCurrentPosition();
          return;
        } catch (err) {
          setError("No se pudo obtener la ubicación");
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getBusinessesByProximity(coords.lat, coords.lng, radius);
        const data = Array.isArray(response.data) ? response.data : [response.data];

        setBusinesses(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error en búsqueda por proximidad";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [userCoords, radius, getCurrentPosition]
  );

  return {
    businesses,
    loading,
    error,
    searchNearby,
    userCoords,
  };
}

// Hook para búsquedas avanzadas
export function useBusinessSearch() {
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string, filters: BusinessFilters = {}) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await searchBusinesses(query, filters);
      const data = Array.isArray(response.data) ? response.data : [response.data];

      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error en la búsqueda";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}

// Hook para mutaciones (crear, actualizar, eliminar)
export function useBusinessMutations() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const createBusinessMutation = async (data: CreateBusinessData) => {
    try {
      setLoading(true);
      const response = await createBusiness(data, token || undefined);
      return response.data;
    } catch (error) {
      console.error("Error creating business:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessMutation = async (id: string, data: Partial<CreateBusinessData>) => {
    try {
      setLoading(true);
      const response = await updateBusiness(id, data, token || undefined);
      return response.data;
    } catch (error) {
      console.error("Error updating business:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBusinessMutation = async (id: string) => {
    try {
      setLoading(true);
      await deleteBusiness(id, token || undefined);
    } catch (error) {
      console.error("Error deleting business:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addReviewMutation = async (id: string, review: BusinessReview) => {
    try {
      setLoading(true);
      const response = await addBusinessReview(id, review, token || undefined);
      return response.data;
    } catch (error) {
      console.error("Error adding business review:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBusiness: createBusinessMutation,
    updateBusiness: updateBusinessMutation,
    deleteBusiness: deleteBusinessMutation,
    addReview: addReviewMutation,
    loading,
  };
}
