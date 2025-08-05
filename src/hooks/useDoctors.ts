"use client";

import { useState, useCallback } from "react";
import {
  getDoctors,
  getDoctor,
  searchDoctors,
  addDoctorReview,
  Doctor,
} from "@/lib/api/doctors";
import { processBackendResponse } from "@/lib/api/config";
import { toast } from "sonner";

export function useDoctors(initialDoctors: Doctor[] = []) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Refetch doctor data to get updated reviews
        getDoctorById(id);
      } catch (err) {
        const e = err as Error;
        setError(e.message);
        toast.error("Failed to add review");
      }
    },
    [getDoctorById]
  );

  return {
    doctors,
    currentDoctor,
    isLoading,
    error,
    fetchDoctors,
    getDoctorById,
    handleSearch,
    handleAddReview,
  };
} 