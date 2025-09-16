"use client";

import { useState } from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { BusinessCard } from "./business-card";
import { useBusinesses } from "@/hooks/useBusinesses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// Using native selects for consistent hydration and simplicity
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const BUSINESS_TYPES = [
  "Tienda de Alimentos",
  "Restaurante",
  "Café",
  "Panadería",
  "Suplementos",
  "Ropa y Accesorios",
  "Belleza y Cuidado",
  "Servicios",
  "Fitness y Bienestar",
  "Educación",
  "Otro",
];

interface BusinessListProps {
  title?: string;
  showFilters?: boolean;
  limit?: number;
}

export const BusinessList = ({
  title = "Negocios Veganos",
  showFilters = true,
  limit,
}: BusinessListProps) => {
  const [search, setSearch] = useState("");
  const [typeBusiness, setTypeBusiness] = useState<string>("");
  const [rating, setRating] = useState<number>();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { businesses, loading, error } = useBusinesses({
    search: search || undefined,
    typeBusiness: typeBusiness || undefined,
    rating: rating || undefined,
    limit: limit || undefined,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useBusinesses hook via dependency array
  };

  const clearFilters = () => {
    setSearch("");
    setTypeBusiness("");
    setRating(undefined);
  };

  const activeFiltersCount = [search, typeBusiness, rating].filter(Boolean).length;

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600">Error al cargar negocios: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
          Reintentar
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">
          {loading ? "Cargando..." : `${businesses.length} negocios encontrados`}
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardContent className="space-y-4 p-4">
            {/* Main Search */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar negocios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </form>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo de Negocio</label>
                  <select
                    value={typeBusiness}
                    onChange={(e) => setTypeBusiness(e.target.value)}
                    className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="">Todos los tipos</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Calificación Mínima</label>
                  <select
                    value={rating?.toString() || ""}
                    onChange={(e) => setRating(e.target.value ? Number(e.target.value) : undefined)}
                    className="border-input focus:ring-ring rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="">Cualquier calificación</option>
                    <option value="4">4+ estrellas</option>
                    <option value="3">3+ estrellas</option>
                    <option value="2">2+ estrellas</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2">
                {search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Búsqueda: {search}
                    <button
                      onClick={() => setSearch("")}
                      className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {typeBusiness && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Tipo: {typeBusiness}
                    <button
                      onClick={() => setTypeBusiness("")}
                      className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {rating && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {rating}+ estrellas
                    <button
                      onClick={() => setRating(undefined)}
                      className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No se encontraron negocios</h3>
          <p className="mb-4 text-gray-600">
            Intenta ajustar tus filtros de búsqueda o explora diferentes tipos de negocios.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar Filtros
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessCard key={business._id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
};
