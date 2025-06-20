import { DoctorList } from "@/components/features/doctors/doctor-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getDoctors } from "@/lib/api/doctors";

export default async function DoctorsPage() {
  const initialDoctors = await getDoctors();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Find Vegan-Friendly Doctors
            </h1>
            <p className="text-gray-600">
              Connect with healthcare professionals who understand and support vegan lifestyles
            </p>
          </div>
          <Button asChild>
            <Link href="/doctors/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Doctor
            </Link>
          </Button>
        </div>

        {/* Doctor List */}
        <DoctorList initialDoctors={initialDoctors} />
      </div>
    </div>
  );
} 