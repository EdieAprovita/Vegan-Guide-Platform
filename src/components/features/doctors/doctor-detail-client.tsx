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
      <div className="container mx-auto animate-pulse px-4 py-8">
        <div className="h-96 rounded-lg bg-gray-200" />
      </div>
    );
  }

  if (!currentDoctor) {
    return notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Doctors
        </Button>
        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
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
