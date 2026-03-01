import { Metadata } from "next";
import { getDoctor } from "@/lib/api/doctors";
import { DoctorDetailClient } from "../../../components/features/doctors/doctor-detail-client";

interface DoctorDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DoctorDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const response = await getDoctor(id);
    const doctor = response.data;
    return {
      title: `${doctor.name} | Verde Guide`,
      description: `${doctor.specialty} en ${doctor.address}. Rating: ${doctor.rating}/5. Especialista en salud vegana.`,
      openGraph: {
        title: `${doctor.name} | Verde Guide`,
        description: `${doctor.specialty} en ${doctor.address}`,
      },
    };
  } catch {
    return {
      title: "Doctor | Verde Guide",
      description: "Detalles del profesional de salud vegana seleccionado.",
    };
  }
}

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { id } = await params;

  return <DoctorDetailClient doctorId={id} />;
}
