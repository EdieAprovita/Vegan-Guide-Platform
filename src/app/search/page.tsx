import { Metadata } from "next";
import { AdvancedSearch } from "@/components/features/search/advanced-search";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Búsqueda Avanzada | Verde Guide",
  description:
    "Busca restaurantes, recetas, negocios veganos y más con nuestra búsqueda avanzada. Filtra por ubicación, calificación y tipo de contenido.",
  keywords: ["búsqueda", "vegano", "restaurantes", "recetas", "negocios", "filtros", "ubicación"],
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto space-y-6 px-4 py-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>

          <div className="space-y-3 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="rounded-full bg-green-100 p-3">
                <Search className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900">Búsqueda Avanzada</h1>

            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Encuentra exactamente lo que buscas en nuestra comunidad vegana. Busca entre miles de
              restaurantes, recetas, negocios y más.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-400"></span>
                <span>🍽️ Restaurantes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400"></span>
                <span>👨‍🍳 Recetas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                <span>🛒 Mercados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                <span>🏪 Negocios</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400"></span>
                <span>👩‍⚕️ Profesionales</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <AdvancedSearch />

        {/* Tips Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">💡 Tips para una mejor búsqueda</h3>
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">🔍 Términos de búsqueda</h4>
              <ul className="space-y-1">
                <li>
                  • Usa palabras específicas: &quot;pizza vegana&quot; en lugar de
                  &quot;comida&quot;
                </li>
                <li>• Combina términos: &quot;restaurante italiano Milano&quot;</li>
                <li>• Incluye el nombre de la ciudad para resultados locales</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">📍 Filtros de ubicación</h4>
              <ul className="space-y-1">
                <li>• Usa tu ubicación actual para resultados cercanos</li>
                <li>• Ajusta el radio de búsqueda según tus necesidades</li>
                <li>• Busca por ciudad o país específico</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">⭐ Calidad</h4>
              <ul className="space-y-1">
                <li>• Filtra por calificaciones mínimas</li>
                <li>• Ordena por mejor calificado para ver los favoritos</li>
                <li>• Revisa las reviews para más detalles</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">💰 Presupuesto</h4>
              <ul className="space-y-1">
                <li>• Define tu rango de presupuesto</li>
                <li>• Encuentra opciones económicas o premium</li>
                <li>• Compara precios entre similares</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
