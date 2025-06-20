import { DoctorDetailClient } from "../../../components/features/doctors/doctor-detail-client";

interface DoctorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DoctorDetailPage({ params }: DoctorDetailPageProps) {
  const { id } = await params;
  
  return <DoctorDetailClient doctorId={id} />;
} 