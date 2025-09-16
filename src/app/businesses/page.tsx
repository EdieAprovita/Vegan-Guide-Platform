import { Metadata } from "next";
import { BusinessList } from "@/components/features/businesses/business-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Negocios Veganos | Verde Guide",
  description:
    "Descubre negocios veganos: tiendas, servicios, y más opciones para tu estilo de vida vegano.",
};

export default function BusinessesPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Negocios Veganos</h1>
          <p className="mt-2 text-gray-600">
            Encuentra tiendas, servicios y negocios que apoyan el estilo de vida vegano
          </p>
        </div>

        <Button asChild>
          <Link href="/businesses/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Agregar Negocio
          </Link>
        </Button>
      </div>

      {/* Back to Home */}
      <div className="flex justify-start">
        <Button variant="outline" asChild>
          <Link href="/">← Volver al Inicio</Link>
        </Button>
      </div>

      {/* Business List */}
      <BusinessList />
    </div>
  );
}
