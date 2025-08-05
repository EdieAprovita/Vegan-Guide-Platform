"use client";

import { create } from "zustand";
import * as marketsApi from "@/lib/api/markets";
import type { Market, CreateMarketData, MarketReview } from "@/lib/api/markets";
import { processBackendResponse } from "@/lib/api/config";

interface MarketsState {
  markets: Market[];
  currentMarket: Market | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  getMarkets: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    products?: string;
    rating?: number;
    location?: string;
  }) => Promise<void>;
  getMarket: (id: string) => Promise<void>;
  createMarket: (data: CreateMarketData, token?: string) => Promise<void>;
  updateMarket: (id: string, data: Partial<CreateMarketData>, token?: string) => Promise<void>;
  deleteMarket: (id: string, token?: string) => Promise<void>;
  addMarketReview: (id: string, review: MarketReview, token?: string) => Promise<void>;
}

export const useMarkets = create<MarketsState>((set) => ({
  markets: [],
  currentMarket: null,
  isLoading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,

  getMarkets: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.getMarkets(params);
      
      // Use the universal helper to process backend response
      const markets = processBackendResponse<Market>(response) as Market[];
      
      set({
        markets: Array.isArray(markets) ? markets : [],
        totalPages: 1, // Backend doesn't implement pagination yet
        currentPage: 1,
        isLoading: false,
      });
    } catch (err) {
      const error = err as Error;
      console.error('getMarkets error:', error);
      set({ 
        error: error.message, 
        isLoading: false,
        markets: []
      });
      throw error;
    }
  },

  getMarket: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.getMarket(id);
      const market = processBackendResponse<Market>(response) as Market;
      set({ currentMarket: market, isLoading: false });
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createMarket: async (data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.createMarket(data, token);
      const market = processBackendResponse<Market>(response) as Market;
      set((state) => ({
        markets: [market, ...state.markets],
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateMarket: async (id, data, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.updateMarket(id, data, token);
      const updatedMarket = processBackendResponse<Market>(response) as Market;
      set((state) => ({
        markets: state.markets.map((market) =>
          market._id === id ? updatedMarket : market
        ),
        currentMarket:
          state.currentMarket?._id === id ? updatedMarket : state.currentMarket,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteMarket: async (id, token) => {
    try {
      set({ isLoading: true, error: null });
      await marketsApi.deleteMarket(id, token);
      set((state) => ({
        markets: state.markets.filter((market) => market._id !== id),
        currentMarket: state.currentMarket?._id === id ? null : state.currentMarket,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addMarketReview: async (id, review, token) => {
    try {
      set({ isLoading: true, error: null });
      const response = await marketsApi.addMarketReview(id, review, token);
      const updatedMarket = processBackendResponse<Market>(response) as Market;
      set((state) => ({
        markets: state.markets.map((market) =>
          market._id === id ? updatedMarket : market
        ),
        currentMarket:
          state.currentMarket?._id === id ? updatedMarket : state.currentMarket,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as Error;
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));