"use client";

import { create } from "zustand";
import * as businessesApi from "@/lib/api/businesses";
import type { Business, CreateBusinessData, BusinessReview } from "@/lib/api/businesses";
import { processBackendResponse } from "@/lib/api/config";

interface BusinessesState {
  businesses: Business[];
  currentBusiness: Business | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  getBusinesses: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    typeBusiness?: string;
    rating?: number;
    location?: string;
  }) => Promise<void>;
  getBusiness: (id: string) => Promise<void>;
  createBusiness: (data: CreateBusinessData) => Promise<void>;
  updateBusiness: (id: string, data: Partial<CreateBusinessData>) => Promise<void>;
  deleteBusiness: (id: string) => Promise<void>;
  addBusinessReview: (id: string, review: BusinessReview) => Promise<void>;
}

export const useBusinesses = create<BusinessesState>((set, get) => ({
  businesses: [],
  currentBusiness: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,

  getBusinesses: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await businessesApi.getBusinesses(params);
      
      // Use the universal helper to process backend response
      const businesses = processBackendResponse<Business>(response) as Business[];
      
      set({
        businesses: Array.isArray(businesses) ? businesses : [],
        totalPages: 1, // Backend doesn't implement pagination yet
        currentPage: 1,
        isLoading: false,
      });
    } catch (err) {
      const error = err as Error;
      console.error('getBusinesses error:', error);
      set({ 
        error: error.message, 
        isLoading: false,
        businesses: []
      });
      throw error;
    }
  },

  getBusiness: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await businessesApi.getBusiness(id);
      const business = processBackendResponse<Business>(response) as Business;
      set({ currentBusiness: business, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createBusiness: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await businessesApi.createBusiness(data);
      const business = processBackendResponse<Business>(response) as Business;
      set((state) => ({
        businesses: [business, ...state.businesses],
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateBusiness: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await businessesApi.updateBusiness(id, data);
      const updatedBusiness = processBackendResponse<Business>(response) as Business;
      set((state) => ({
        businesses: state.businesses.map(business => 
          business._id === id ? updatedBusiness : business
        ),
        currentBusiness: state.currentBusiness?._id === id ? updatedBusiness : state.currentBusiness,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteBusiness: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await businessesApi.deleteBusiness(id);
      set((state) => ({
        businesses: state.businesses.filter(business => business._id !== id),
        currentBusiness: state.currentBusiness?._id === id ? null : state.currentBusiness,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addBusinessReview: async (id, review) => {
    try {
      set({ isLoading: true, error: null });
      const response = await businessesApi.addBusinessReview(id, review);
      const updatedBusiness = processBackendResponse<Business>(response) as Business;
      set((state) => ({
        businesses: state.businesses.map(business => 
          business._id === id ? updatedBusiness : business
        ),
        currentBusiness: state.currentBusiness?._id === id ? updatedBusiness : state.currentBusiness,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
