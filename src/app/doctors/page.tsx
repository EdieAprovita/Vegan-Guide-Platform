import { SimpleDoctorList } from "@/components/features/doctors/simple-doctor-list";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getDoctors } from "@/lib/api/doctors";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DoctorsPage() {
  let initialDoctors = [];
  
  try {
    const response = await getDoctors();
    // Ensure we always pass an array
    initialDoctors = Array.isArray(response) ? response : (response?.doctors || []);
    console.log("Server-side doctors fetch result:", initialDoctors);
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
    // Continue with empty array, the client-side will handle the loading
    initialDoctors = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button asChild variant="outline" size="sm" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

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
        <SimpleDoctorList initialDoctors={initialDoctors} />
      </div>
    </div>
  );
} 