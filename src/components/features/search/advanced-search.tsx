"use client";

import { useState } from "react";
import { Search, MapPin, Star, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useAdvancedSearch, useGeolocation } from "@/hooks/useAdvancedSearch";
import { SearchResults } from "./search-results";
import { ResourceType, SortOption } from "@/types/search";
import { queryKeys } from "@/lib/api/queryKeys";

const RESOURCE_TYPES: Array<{
  id: ResourceType;
  label: string;
  emoji: string;
  description: string;
}> = [
  {
    id: "restaurants",
    label: "Restaurantes",
    emoji: "🍽️",
    description: "Lugares para comer vegano",
  },
  { id: "recipes", label: "Recetas", emoji: "👨‍🍳", description: "Recetas veganas deliciosas" },
  { id: "markets", label: "Mercados", emoji: "🛒", description: "Tiendas y mercados" },
  { id: "doctors", label: "Doctores", emoji: "👩‍⚕️", description: "Profesionales de la salud" },
  { id: "businesses", label: "Negocios", emoji: "🏪", description: "Negocios veganos" },
  { id: "sanctuaries", label: "Santuarios", emoji: "🐄", description: "Santuarios de animales" },
  { id: "posts", label: "Posts", emoji: "📝", description: "Publicaciones de la comunidad" },
];

const SORT_OPTIONS: Array<{
  value: SortOption;
  label: string;
  description: string;
}> = [
  { value: "relevance", label: "Relevancia", description: "Más relevante primero" },
  { value: "rating", label: "Calificación", description: "Mejor calificados primero" },
  { value: "distance", label: "Distancia", description: "Más cercanos primero" },
  { value: "newest", label: "Más recientes", description: "Agregados recientemente" },
  { value: "oldest", label: "Más antiguos", description: "Los más antiguos primero" },
];

export const AdvancedSearch = () => {
  const queryClient = useQueryClient();
  const {
    searchState,
    suggestions,
    aggregations,
    search,
    loadMore,
    clearFilters,
    setQuery,
    setSortBy,
    setResourceTypes,
    setLocation,
    setRadius,
    setMinRating,
    setBudgetRange,
    getUserLocation,
    hasActiveFilters,
    getActiveFiltersCount,
    canLoadMore,
    hasResults,
    isEmpty,
  } = useAdvancedSearch();

  const {
    coordinates,
    isLoading: geoLoading,
    error: geoError,
    getCurrentPosition,
    isSupported: geoSupported,
  } = useGeolocation();

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [budgetRange, setBudgetRangeLocal] = useState<[number, number]>([0, 1000]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
    search();
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    search();
  };

  const handleResourceTypeToggle = (resourceType: ResourceType, checked: boolean) => {
    const currentTypes = searchState.filters.resourceTypes;
    if (checked) {
      setResourceTypes([...currentTypes, resourceType]);
    } else {
      setResourceTypes(currentTypes.filter((type) => type !== resourceType));
    }
  };

  const handleGetLocation = async () => {
    try {
      await getCurrentPosition();
      await getUserLocation();
      // Optionally set a default location name based on coordinates
      // This would require a reverse geocoding service
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const handleBudgetRangeChange = (values: number[]) => {
    setBudgetRangeLocal(values as [number, number]);
    setBudgetRange(values[0], values[1]);
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda Avanzada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search */}
          <form onSubmit={handleSearch} className="space-y-4" noValidate>
            <div className="relative">
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400"
                  aria-hidden="true"
                />
                <label htmlFor="advanced-search-input" className="sr-only">
                  Buscar restaurantes, recetas, negocios veganos
                </label>
                <Input
                  id="advanced-search-input"
                  type="search"
                  placeholder="Buscar restaurantes, recetas, negocios..."
                  value={searchState.filters.query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="pr-4 pl-10"
                  aria-label="Buscar restaurantes, recetas, negocios veganos"
                  autoComplete="off"
                  onFocus={() => setShowSuggestions(searchState.filters.query.length >= 2)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
              </div>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto">
                  <CardContent className="p-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros Avanzados
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {geoSupported && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                  className="flex items-center gap-2"
                >
                  {geoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {coordinates ? "Actualizar Ubicación" : "Usar Mi Ubicación"}
                </Button>
              )}

              <Button type="submit" disabled={searchState.isSearching}>
                {searchState.isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
          </form>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap items-center gap-2 border-t pt-2">
              <span className="text-sm font-medium text-gray-700">Filtros activos:</span>

              {searchState.filters.query && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Búsqueda: &quot;{searchState.filters.query}&quot;
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label={`Eliminar filtro de búsqueda: ${searchState.filters.query}`}
                    className="inline-flex items-center"
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-red-600" aria-hidden="true" />
                  </button>
                </Badge>
              )}

              {searchState.filters.resourceTypes.map((type) => {
                const resourceLabel = RESOURCE_TYPES.find((rt) => rt.id === type)?.label ?? type;
                return (
                  <Badge key={type} variant="secondary" className="flex items-center gap-1">
                    {RESOURCE_TYPES.find((rt) => rt.id === type)?.emoji} {resourceLabel}
                    <button
                      type="button"
                      onClick={() => handleResourceTypeToggle(type, false)}
                      aria-label={`Eliminar filtro de tipo: ${resourceLabel}`}
                      className="inline-flex items-center"
                    >
                      <X className="h-3 w-3 cursor-pointer hover:text-red-600" aria-hidden="true" />
                    </button>
                  </Badge>
                );
              })}

              {searchState.filters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {searchState.filters.location}
                  <button
                    type="button"
                    onClick={() => setLocation("")}
                    aria-label={`Eliminar filtro de ubicación: ${searchState.filters.location}`}
                    className="inline-flex items-center"
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-red-600" aria-hidden="true" />
                  </button>
                </Badge>
              )}

              {searchState.filters.minRating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Star className="h-3 w-3" aria-hidden="true" />
                  {searchState.filters.minRating}+ estrellas
                  <button
                    type="button"
                    onClick={() => setMinRating(0)}
                    aria-label={`Eliminar filtro de calificación mínima: ${searchState.filters.minRating} estrellas`}
                    className="inline-flex items-center"
                  >
                    <X className="h-3 w-3 cursor-pointer hover:text-red-600" aria-hidden="true" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <X className="mr-1 h-4 w-4" />
                Limpiar todo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros Avanzados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resource Types */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Tipos de Contenido</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {RESOURCE_TYPES.map((resourceType) => (
                  <div key={resourceType.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={resourceType.id}
                      checked={searchState.filters.resourceTypes.includes(resourceType.id)}
                      onCheckedChange={(checked) =>
                        handleResourceTypeToggle(resourceType.id, checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={resourceType.id}
                        className="flex cursor-pointer items-center gap-2 text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <span>{resourceType.emoji}</span>
                        {resourceType.label}
                        {aggregations?.resourceTypes[resourceType.id] && (
                          <Badge variant="outline" className="text-xs">
                            {aggregations.resourceTypes[resourceType.id]}
                          </Badge>
                        )}
                      </label>
                      <p className="text-muted-foreground text-xs">{resourceType.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Location and Distance */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="advanced-location" className="text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <Input
                  id="advanced-location"
                  type="text"
                  placeholder="Ciudad, país..."
                  value={searchState.filters.location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {geoError && (
                  <p role="alert" className="text-xs text-red-600">
                    {geoError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="advanced-radius"
                  className="text-sm font-medium text-gray-700"
                  id="advanced-radius-label"
                >
                  Radio de búsqueda: {searchState.filters.radius}km
                </label>
                <Slider
                  id="advanced-radius"
                  value={[searchState.filters.radius]}
                  onValueChange={(value) => setRadius(value[0])}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                  disabled={!searchState.filters.location && !coordinates}
                  aria-labelledby="advanced-radius-label"
                  aria-valuetext={`${searchState.filters.radius} kilómetros`}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1km</span>
                  <span>100km</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rating and Budget */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="advanced-min-rating" className="text-sm font-medium text-gray-700">
                  Calificación mínima
                </label>
                <Select
                  value={searchState.filters.minRating.toString()}
                  onValueChange={(value) => setMinRating(Number(value))}
                >
                  <SelectTrigger id="advanced-min-rating" aria-label="Calificación mínima">
                    <SelectValue placeholder="Cualquier calificación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Cualquier calificación</SelectItem>
                    <SelectItem value="1">1+ estrellas</SelectItem>
                    <SelectItem value="2">2+ estrellas</SelectItem>
                    <SelectItem value="3">3+ estrellas</SelectItem>
                    <SelectItem value="4">4+ estrellas</SelectItem>
                    <SelectItem value="5">5 estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label id="advanced-budget-label" className="text-sm font-medium text-gray-700">
                  Rango de presupuesto: ${budgetRange[0]} - ${budgetRange[1]}
                </label>
                <Slider
                  value={budgetRange}
                  onValueChange={handleBudgetRangeChange}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                  aria-labelledby="advanced-budget-label"
                  aria-valuetext={`$${budgetRange[0]} a $${budgetRange[1]}`}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>$0</span>
                  <span>$1000+</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Sort Options */}
            <div className="space-y-2">
              <label htmlFor="advanced-sort-by" className="text-sm font-medium text-gray-700">
                Ordenar por
              </label>
              <Select
                value={searchState.filters.sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger id="advanced-sort-by" aria-label="Ordenar resultados por">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <div
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions removals"
        aria-label="Resultados de búsqueda"
      >
        {/* Visually hidden status for screen readers */}
        <span role="status" className="sr-only">
          {searchState.isSearching
            ? "Buscando resultados…"
            : searchState.total > 0
              ? `${searchState.total} resultado${searchState.total !== 1 ? "s" : ""} encontrado${searchState.total !== 1 ? "s" : ""}`
              : searchState.filters.query
                ? "No se encontraron resultados"
                : ""}
        </span>
        <SearchResults
          results={searchState.results}
          isLoading={searchState.isSearching}
          error={searchState.error}
          total={searchState.total}
          hasMore={canLoadMore}
          onLoadMore={loadMore}
          isEmpty={isEmpty}
          hasResults={hasResults}
          query={searchState.filters.query}
          onClearFilters={clearFilters}
          onRetry={handleRetry}
        />
      </div>
    </div>
  );
};
