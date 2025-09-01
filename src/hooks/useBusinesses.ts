"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { 
  getBusinesses, 
  getBusiness, 
  createBusiness, 
  updateBusiness, 
  deleteBusiness,
  addBusinessReview,
  Business, 
  CreateBusinessData,
  BusinessReview 
} from '@/lib/api/businesses';

export function useBusinesses(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  typeBusiness?: string;
  rating?: number;
  location?: string;
}) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBusinesses(filters);
      setBusinesses(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar negocios';
      setError(errorMessage);
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.page, filters?.limit, filters?.search, filters?.typeBusiness, filters?.rating, filters?.location]);

  return { businesses, loading, error, refetch: fetchBusinesses };
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
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el negocio';
        setError(errorMessage);
        console.error('Error fetching business:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  return { business, loading, error };
}

export function useBusinessMutations() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const createBusinessMutation = async (data: CreateBusinessData) => {
    try {
      setLoading(true);
      const response = await createBusiness(data, token || undefined);
      return response.data;
    } catch (error) {
      console.error('Error creating business:', error);
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
      console.error('Error updating business:', error);
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
      console.error('Error deleting business:', error);
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
      console.error('Error adding business review:', error);
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
    loading
  };
}
