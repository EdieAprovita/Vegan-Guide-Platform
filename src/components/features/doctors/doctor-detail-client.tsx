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
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => window.history.back()}
          aria-label="Volver a Doctores"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to Doctors
        </Button>
        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <Image
                src={currentDoctor.author.photo || "/placeholder-doctor.jpg"}
                alt={"Dr. " + currentDoctor.name + " - Profesional de salud vegana"}
                width={300}
                height={300}
                className="h-full w-full object-cover md:w-64"
                priority
                sizes="(max-width: 768px) 100vw, 300px"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PC9zdmc+"
              />
            </div>
            <div className="p-8">
              <div className="text-sm font-semibold tracking-wide text-emerald-500 uppercase">
                {currentDoctor.specialty}
              </div>
              <h1 className="mt-1 block text-2xl leading-tight font-bold text-gray-900">
                Dr. {currentDoctor.name}
              </h1>
              {currentDoctor.address && (
                <p className="mt-3 flex items-center text-gray-600">
                  <span className="sr-only">Direccion:</span>
                  {currentDoctor.address}
                </p>
              )}
              {currentDoctor.languages && currentDoctor.languages.length > 0 && (
                <div className="mt-3">
                  <h2 className="text-sm font-semibold text-gray-700">Idiomas</h2>
                  <p className="text-gray-600">{currentDoctor.languages.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
