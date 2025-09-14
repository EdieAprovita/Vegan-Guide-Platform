import { Metadata } from "next";
import { BusinessForm } from "@/components/features/businesses/business-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Agregar Negocio | Verde Guide",
  description: "Comparte un negocio vegano con la comunidad.",
};

export default function NewBusinessPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/businesses" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver a Negocios
          </Link>
        </Button>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Agregar Nuevo Negocio</h1>
        <p className="text-gray-600">
          Comparte un negocio vegano con la comunidad y ayuda a otros a descubrir lugares increíbles
        </p>
      </div>

      {/* Form */}
      <BusinessForm mode="create" />
    </div>
  );
}
