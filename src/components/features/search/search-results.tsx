'use client';

import { MapPin, Star, Users, Clock, DollarSign, Utensils, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchResult, ResourceType } from '@/types/search';
import { formatDistance } from '@/lib/utils/geospatial';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
  isEmpty: boolean;
  hasResults: boolean;
  query?: string;
  onClearFilters: () => void;
}

const RESOURCE_TYPE_CONFIG: Record<ResourceType, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  href: (id: string) => string;
}> = {
  restaurants: {
    icon: <Utensils className="h-4 w-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    href: (id) => `/restaurants/${id}`,
  },
  recipes: {
    icon: <Heart className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    href: (id) => `/recipes/${id}`,
  },
  markets: {
    icon: <MapPin className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    href: (id) => `/markets/${id}`,
  },
  doctors: {
    icon: <Users className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    href: (id) => `/doctors/${id}`,
  },
  businesses: {
    icon: <MapPin className="h-4 w-4" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    href: (id) => `/businesses/${id}`,
  },
  sanctuaries: {
    icon: <Heart className="h-4 w-4" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    href: (id) => `/sanctuaries/${id}`,
  },
  posts: {
    icon: <MessageCircle className="h-4 w-4" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    href: (id) => `/posts/${id}`,
  },
};

const SearchResultCard = ({ result }: { result: SearchResult }) => {
  const config = RESOURCE_TYPE_CONFIG[result.resourceType];
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-48 h-48 sm:h-32 overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
            <img
              src={result.image || '/placeholder-image.jpg'}
              alt={result.title || 'Result image'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            
            {/* Resource Type Badge */}
            <div className="absolute top-2 left-2">
              <Badge className={`${config.bgColor} ${config.color} border-0`}>
                {config.icon}
                <span className="ml-1 capitalize">{result.resourceType}</span>
              </Badge>
            </div>

            {/* Rating Badge */}
            {result.rating && (
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-900">
                  {result.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                <Link href={config.href(result._id)}>
                  {result.title}
                </Link>
              </h3>
              
              <p className="text-sm text-gray-600 line-clamp-2">
                {result.description}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {result.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-32">{result.address}</span>
                </div>
              )}

              {result.distance && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistance(result.distance)}</span>
                </div>
              )}

              {result.numReviews && result.numReviews > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{result.numReviews} review{result.numReviews !== 1 ? 's' : ''}</span>
                </div>
              )}

              {result.budget && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${result.budget}</span>
                </div>
              )}
            </div>

            {/* Type-specific info */}
            <div className="flex flex-wrap gap-2">
              {result.cuisine && (
                <Badge variant="outline" className="text-xs">
                  {result.cuisine}
                </Badge>
              )}

              {result.specialty && (
                <Badge variant="outline" className="text-xs">
                  {result.specialty}
                </Badge>
              )}

              {result.typeBusiness && (
                <Badge variant="outline" className="text-xs">
                  {result.typeBusiness}
                </Badge>
              )}

              {result.ingredients && result.ingredients.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {result.ingredients.slice(0, 2).join(', ')}
                  {result.ingredients.length > 2 && ` +${result.ingredients.length - 2}`}
                </Badge>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                <Link href={config.href(result._id)}>
                  Ver detalles
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SearchResultSkeleton = () => (
  <Card className="border-gray-200">
    <CardContent className="p-0">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="w-full sm:w-48 h-48 sm:h-32 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none" />
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const SearchResults = ({
  results,
  isLoading,
  error,
  total,
  hasMore,
  onLoadMore,
  isEmpty,
  hasResults,
  query,
  onClearFilters,
}: SearchResultsProps) => {
  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-600">Error en la búsqueda</h3>
          <p className="text-gray-600">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </Card>
    );
  }

  if (isEmpty && !isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              No se encontraron resultados
            </h3>
            {query ? (
              <p className="text-gray-600">
                No encontramos resultados para &quot;<strong>{query}</strong>&quot;.
                <br />
                Intenta con otros términos de búsqueda o ajusta los filtros.
              </p>
            ) : (
              <p className="text-gray-600">
                Ajusta los filtros de búsqueda para encontrar lo que buscas.
              </p>
            )}
          </div>

          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      {(hasResults || isLoading) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Resultados de búsqueda
            </h2>
            {!isLoading && total > 0 && (
              <Badge variant="secondary" className="text-sm">
                {total.toLocaleString()} resultado{total !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {query && (
            <div className="text-sm text-gray-600">
              Buscando: &quot;<strong>{query}</strong>&quot;
            </div>
          )}
        </div>
      )}

      {/* Results Grid */}
      <div className="space-y-4">
        {results.map((result) => (
          <SearchResultCard key={result._id} result={result} />
        ))}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(results.length > 0 ? 3 : 6)].map((_, i) => (
              <SearchResultSkeleton key={i} />
            ))}
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && !isLoading && (
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            className="min-w-32"
          >
            Cargar más resultados
          </Button>
        </div>
      )}

      {/* End of Results */}
      {hasResults && !hasMore && !isLoading && (
        <div className="text-center py-6 border-t">
          <p className="text-sm text-gray-500">
            Has visto todos los {total} resultado{total !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};