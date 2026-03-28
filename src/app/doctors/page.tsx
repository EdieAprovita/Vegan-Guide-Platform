import { Metadata } from "next";
import { SimpleDoctorList } from "@/components/features/doctors/simple-doctor-list";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Doctores Veganos | Verde Guide",
  description:
    "Encuentra doctores y profesionales de salud que apoyan y entienden el estilo de vida vegano. Especialistas en nutrición vegana cerca de ti.",
  keywords: ["doctores veganos", "nutricionistas veganos", "salud vegana", "médicos plant-based"],
  openGraph: {
    title: "Doctores Veganos | Verde Guide",
    description:
      "Encuentra doctores y profesionales de salud que apoyan y entienden el estilo de vida vegano.",
  },
};

// Re-generate the page at most once per hour (ISR)
export const revalidate = 3600;

export default async function DoctorsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Find Vegan-Friendly Doctors</h1>
            <p className="text-gray-600">
              Connect with healthcare professionals who understand and support vegan lifestyles
            </p>
          </div>
          <Button asChild>
            <Link href="/doctors/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Link>
          </Button>
        </div>

        {/* Doctor List */}
        <SimpleDoctorList />
      </div>
    </div>
  );
}
