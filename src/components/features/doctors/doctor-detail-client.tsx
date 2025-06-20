"use client";

import { useEffect } from "react";
import { useDoctors } from "@/hooks/useDoctors";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

interface DoctorDetailClientProps {
  doctorId: string;
}

export function DoctorDetailClient({ doctorId }: DoctorDetailClientProps) {
  const { currentDoctor, isLoading, getDoctorById } = useDoctors();

  useEffect(() => {
    getDoctorById(doctorId);
  }, [getDoctorById, doctorId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!currentDoctor) {
    return notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Doctors
        </Button>
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <Image
                src={currentDoctor.author.photo || "/placeholder-doctor.jpg"}
                alt={`Photo of ${currentDoctor.name}`}
                width={300}
                height={300}
                className="h-full w-full object-cover md:w-64"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
