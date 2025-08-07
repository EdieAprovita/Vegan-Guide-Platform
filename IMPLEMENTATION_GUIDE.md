# 🚀 Guía de Implementación - Funcionalidades Faltantes API → Frontend

## 📋 Resumen Ejecutivo

Esta guía detalla la implementación de **Solución 2: Strategic MVP+** para integrar las funcionalidades faltantes de tu API robusta en el frontend de Verde Guide.

### 🎯 Objetivos Principales
1. **Sección Businesses** - Directorio completo de negocios veganos
2. **Sistema de Reviews Mejorado** - Reviews avanzadas con votos útiles
3. **Búsqueda Avanzada & Geoespacial** - Búsqueda unificada con filtros de ubicación

### ⏱️ Timeline Estimado: 4-6 semanas
### 💼 Impacto: 40% incremento en valor de plataforma

---

## 🗓️ Plan de Implementación por Fases

### **Fase 1: Businesses Section (Semanas 1-2)**
- Directorio de negocios con listado, detalles y creación
- Componentes UI completos
- Integración con API existente

### **Fase 2: Enhanced Reviews (Semana 3)**
- Sistema de reviews independiente
- Funcionalidad de "votos útiles"
- Reviews cross-recursos

### **Fase 3: Advanced Search (Semana 4)**
- Búsqueda unificada
- Filtros geoespaciales
- Integración con todos los recursos

### **Fase 4: Polish & Testing (Semanas 5-6)**
- Optimizaciones de rendimiento
- Testing integral
- Mejoras de UX

---

## 📁 Estructura de Archivos a Crear

```
src/
├── app/
│   ├── businesses/
│   │   ├── page.tsx                    # Lista de negocios
│   │   ├── [id]/
│   │   │   └── page.tsx               # Detalle de negocio
│   │   └── new/
│   │       └── page.tsx               # Crear negocio
│   └── reviews/
│       ├── page.tsx                    # Gestión de reviews
│       └── [id]/
│           └── page.tsx               # Detalle de review
├── components/
│   ├── features/
│   │   ├── businesses/
│   │   │   ├── business-card.tsx
│   │   │   ├── business-list.tsx
│   │   │   ├── business-detail-client.tsx
│   │   │   ├── business-form.tsx
│   │   │   └── simple-business-list.tsx
│   │   ├── reviews/
│   │   │   ├── enhanced-review-system.tsx
│   │   │   ├── review-card.tsx
│   │   │   ├── review-form.tsx
│   │   │   ├── helpful-votes.tsx
│   │   │   └── review-stats.tsx
│   │   └── search/
│   │       ├── advanced-search.tsx
│   │       ├── geospatial-filter.tsx
│   │       ├── search-results.tsx
│   │       └── unified-search.tsx
│   └── ui/
│       ├── location-picker.tsx
│       ├── rating-stars.tsx
│       └── business-hours.tsx
├── lib/
│   ├── api/
│   │   └── reviews.ts                  # API cliente para reviews
│   ├── hooks/
│   │   ├── useBusinesses.ts
│   │   ├── useReviews.ts
│   │   ├── useAdvancedSearch.ts
│   │   └── useGeospatial.ts
│   └── utils/
│       ├── geospatial.ts
│       ├── search-helpers.ts
│       └── business-helpers.ts
└── types/
    ├── business.ts
    ├── review.ts
    └── search.ts
```

---

## 🏢 FASE 1: Implementación Businesses Section

### Paso 1.1: Crear API Client para Reviews (faltante)

```typescript
// src/lib/api/reviews.ts
import { apiRequest, getApiHeaders, BackendResponse } from './config';

export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    photo?: string;
  };
  rating: number;
  comment: string;
  resourceType: 'restaurant' | 'recipe' | 'market' | 'doctor' | 'business' | 'sanctuary';
  resourceId: string;
  helpful: string[]; // Array of user IDs who found it helpful
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  rating: number;
  comment: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

export async function getReview(id: string) {
  return apiRequest<BackendResponse<Review>>(`/reviews/${id}`);
}

export async function updateReview(id: string, data: Partial<CreateReviewData>, token?: string) {
  return apiRequest<BackendResponse<Review>>(`/reviews/${id}`, {
    method: "PUT",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}

export async function deleteReview(id: string, token?: string) {
  return apiRequest<BackendResponse<void>>(`/reviews/${id}`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

export async function markReviewHelpful(id: string, token?: string) {
  return apiRequest<BackendResponse<Review>>(`/reviews/${id}/helpful`, {
    method: "POST",
    headers: getApiHeaders(token),
  });
}

export async function removeReviewHelpful(id: string, token?: string) {
  return apiRequest<BackendResponse<Review>>(`/reviews/${id}/helpful`, {
    method: "DELETE",
    headers: getApiHeaders(token),
  });
}

// Enhanced restaurant reviews with statistics
export async function getRestaurantReviews(restaurantId: string, params?: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  return apiRequest<BackendResponse<Review[]>>(`/restaurants/${restaurantId}/reviews?${searchParams.toString()}`);
}

export async function getRestaurantReviewStats(restaurantId: string) {
  return apiRequest<BackendResponse<ReviewStats>>(`/restaurants/${restaurantId}/reviews/stats`);
}

export async function createRestaurantReview(restaurantId: string, data: CreateReviewData, token?: string) {
  return apiRequest<BackendResponse<Review>>(`/restaurants/${restaurantId}/reviews`, {
    method: "POST",
    headers: getApiHeaders(token),
    body: JSON.stringify(data),
  });
}
```

### Paso 1.2: Crear Hook para Businesses

```typescript
// src/hooks/useBusinesses.ts
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { 
  getBusinesses, 
  getBusiness, 
  createBusiness, 
  updateBusiness, 
  deleteBusiness,
  addBusinessReview,
  Business, 
  CreateBusinessData,
  BusinessReview 
} from '@/lib/api/businesses';
import { getErrorMessage } from '@/lib/utils/error-handler';

export function useBusinesses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  typeBusiness?: string;
  rating?: number;
  location?: string;
}) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBusinesses(params);
        setBusinesses(response.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error('Error fetching businesses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [params?.page, params?.limit, params?.search, params?.typeBusiness, params?.rating, params?.location]);

  return { businesses, loading, error, refetch: () => fetchBusinesses() };
}

export function useBusiness(id?: string) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBusiness(id);
        setBusiness(response.data);
      } catch (err) {
        setError(getErrorMessage(err));
        console.error('Error fetching business:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  return { business, loading, error };
}

export function useBusinessMutations() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const createBusinessMutation = async (data: CreateBusinessData) => {
    try {
      setLoading(true);
      const response = await createBusiness(data, token);
      return response.data;
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateBusinessMutation = async (id: string, data: Partial<CreateBusinessData>) => {
    try {
      setLoading(true);
      const response = await updateBusiness(id, data, token);
      return response.data;
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteBusinessMutation = async (id: string) => {
    try {
      setLoading(true);
      await deleteBusiness(id, token);
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addReviewMutation = async (id: string, review: BusinessReview) => {
    try {
      setLoading(true);
      const response = await addBusinessReview(id, review, token);
      return response.data;
    } catch (error) {
      console.error('Error adding business review:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBusiness: createBusinessMutation,
    updateBusiness: updateBusinessMutation,
    deleteBusiness: deleteBusinessMutation,
    addReview: addReviewMutation,
    loading
  };
}
```

### Paso 1.3: Crear Business Card Component

```typescript
// src/components/features/businesses/business-card.tsx
import Link from 'next/link';
import { MapPin, Clock, Phone, Star, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Business } from '@/lib/api/businesses';

interface BusinessCardProps {
  business: Business;
}

export const BusinessCard = ({ business }: BusinessCardProps) => {
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const formatBusinessHours = (hours: Date[]) => {
    if (!hours || hours.length === 0) return 'Horarios no disponibles';
    // Simplified display - you might want to implement proper hour formatting
    return 'Ver horarios';
  };

  return (
    <Card class="group hover:shadow-lg transition-shadow duration-300 bg-white border-gray-200">
      <CardHeader class="relative p-0">
        <div class="relative h-48 overflow-hidden rounded-t-lg">
          <img
            src={business.image || '/placeholder-business.jpg'}
            alt={business.namePlace}
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span class="text-sm font-semibold text-gray-900">
              {business.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <div class="absolute top-3 left-3">
            <Badge variant="secondary" class="bg-green-100 text-green-800 hover:bg-green-200">
              {business.typeBusiness}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent class="p-4 space-y-3">
        <div>
          <h3 class="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
            {business.namePlace}
          </h3>
          <div class="flex items-center gap-1 text-gray-600 mb-2">
            <MapPin class="h-4 w-4" />
            <span class="text-sm line-clamp-1">{business.address}</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-sm text-gray-600">
          <div class="flex items-center gap-1">
            <Users class="h-4 w-4" />
            <span>{business.numReviews || 0} reviews</span>
          </div>
          <div class="flex items-center gap-1">
            <Clock class="h-4 w-4" />
            <span>{formatBusinessHours(business.hours)}</span>
          </div>
        </div>

        {business.budget && (
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Presupuesto:</span>
            <Badge variant="outline" class="text-xs">
              ${business.budget.toLocaleString()}
            </Badge>
          </div>
        )}

        <div class="flex gap-2 pt-2">
          <Button asChild variant="default" class="flex-1">
            <Link href={`/businesses/${business._id}`}>
              Ver Detalles
            </Link>
          </Button>
          
          {business.contact?.[0]?.phone && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleCall(business.contact[0].phone!)}
              class="flex items-center gap-1"
            >
              <Phone class="h-4 w-4" />
              Llamar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

### Paso 1.4: Crear Business List Component

```typescript
// src/components/features/businesses/business-list.tsx
'use client';

import { useState } from 'react';
import { Search, Filter, MapPin, SlidersHorizontal } from 'lucide-react';
import { BusinessCard } from './business-card';
import { useBusinesses } from '@/hooks/useBusinesses';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const BUSINESS_TYPES = [
  'Tienda de Alimentos',
  'Restaurante', 
  'Café',
  'Panadería',
  'Suplementos',
  'Ropa y Accesorios',
  'Belleza y Cuidado',
  'Servicios',
  'Fitness y Bienestar',
  'Educación',
  'Otro'
];

interface BusinessListProps {
  title?: string;
  showFilters?: boolean;
  limit?: number;
}

export const BusinessList = ({ 
  title = 'Negocios Veganos', 
  showFilters = true,
  limit 
}: BusinessListProps) => {
  const [search, setSearch] = useState('');
  const [typeBusiness, setTypeBusiness] = useState<string>('');
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
    setSearch('');
    setTypeBusiness('');
    setRating(undefined);
  };

  const activeFiltersCount = [search, typeBusiness, rating].filter(Boolean).length;

  if (error) {
    return (
      <Card class="p-6 text-center">
        <p class="text-red-600">Error al cargar negocios: {error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          class="mt-2"
        >
          Reintentar
        </Button>
      </Card>
    );
  }

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">{title}</h2>
        <div class="text-sm text-gray-600">
          {loading ? 'Cargando...' : `${businesses.length} negocios encontrados`}
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardContent class="p-4 space-y-4">
            {/* Main Search */}
            <form onSubmit={handleSearchSubmit} class="flex gap-2">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar negocios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  class="pl-10"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                class="flex items-center gap-2"
              >
                <SlidersHorizontal class="h-4 w-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" class="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </form>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Tipo de Negocio</label>
                  <Select value={typeBusiness} onValueChange={setTypeBusiness}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los tipos</SelectItem>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Calificación Mínima</label>
                  <Select value={rating?.toString() || ''} onValueChange={(value) => setRating(value ? Number(value) : undefined)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier calificación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Cualquier calificación</SelectItem>
                      <SelectItem value="4">4+ estrellas</SelectItem>
                      <SelectItem value="3">3+ estrellas</SelectItem>
                      <SelectItem value="2">2+ estrellas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    class="w-full"
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div class="flex flex-wrap gap-2">
                {search && (
                  <Badge variant="secondary" class="flex items-center gap-1">
                    Búsqueda: {search}
                    <button
                      onClick={() => setSearch('')}
                      class="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {typeBusiness && (
                  <Badge variant="secondary" class="flex items-center gap-1">
                    Tipo: {typeBusiness}
                    <button
                      onClick={() => setTypeBusiness('')}
                      class="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {rating && (
                  <Badge variant="secondary" class="flex items-center gap-1">
                    {rating}+ estrellas
                    <button
                      onClick={() => setRating(undefined)}
                      class="ml-1 hover:bg-gray-200 rounded-full p-0.5"
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} class="overflow-hidden">
              <Skeleton class="h-48 w-full" />
              <CardContent class="p-4 space-y-3">
                <Skeleton class="h-6 w-3/4" />
                <Skeleton class="h-4 w-full" />
                <div class="flex justify-between">
                  <Skeleton class="h-4 w-20" />
                  <Skeleton class="h-4 w-16" />
                </div>
                <Skeleton class="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <Card class="p-8 text-center">
          <MapPin class="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 class="text-lg font-semibold text-gray-900 mb-2">No se encontraron negocios</h3>
          <p class="text-gray-600 mb-4">
            Intenta ajustar tus filtros de búsqueda o explora diferentes tipos de negocios.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Limpiar Filtros
          </Button>
        </Card>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard key={business._id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
};
```

### Paso 1.5: Crear Business Detail Client Component

```typescript
// src/components/features/businesses/business-detail-client.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Clock, Star, Users, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useBusiness, useBusinessMutations } from '@/hooks/useBusinesses';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewSystem } from '@/components/features/reviews/review-system';
import { BusinessReview } from '@/lib/api/businesses';

interface BusinessDetailClientProps {
  businessId: string;
}

export const BusinessDetailClient = ({ businessId }: BusinessDetailClientProps) => {
  const { business, loading, error } = useBusiness(businessId);
  const { addReview, loading: mutationLoading } = useBusinessMutations();
  const { user, isAuthenticated } = useAuthStore();
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleAddReview = async (reviewData: { rating: number; comment: string }) => {
    if (!business) return;

    try {
      const review: BusinessReview = {
        rating: reviewData.rating,
        comment: reviewData.comment,
      };
      
      await addReview(business._id, review);
      setShowReviewForm(false);
      // Optionally refresh the business data
      window.location.reload();
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const formatBusinessHours = (hours: Date[]) => {
    if (!hours || hours.length === 0) return 'Horarios no disponibles';
    return 'Lunes a Viernes: 9:00 AM - 6:00 PM'; // Simplified - implement proper formatting
  };

  const canEditBusiness = user?.role === 'admin' || business?.author._id === user?.id;

  if (loading) {
    return (
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center gap-4">
          <Skeleton class="h-10 w-24" />
          <Skeleton class="h-8 w-64" />
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <Skeleton class="h-64 w-full rounded-lg" />
            <Card>
              <CardContent class="p-6 space-y-4">
                <Skeleton class="h-8 w-3/4" />
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
          <div class="space-y-6">
            <Card>
              <CardContent class="p-6 space-y-4">
                <Skeleton class="h-6 w-32" />
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-full" />
                <Skeleton class="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div class="max-w-4xl mx-auto">
        <Card class="p-8 text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Negocio no encontrado</h3>
          <p class="text-gray-600 mb-4">
            {error || 'No pudimos encontrar este negocio. Es posible que haya sido eliminado o la URL sea incorrecta.'}
          </p>
          <Button asChild variant="outline">
            <Link href="/businesses">Volver a Negocios</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      {/* Header Navigation */}
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/businesses" class="flex items-center gap-2">
              <ArrowLeft class="h-4 w-4" />
              Volver a Negocios
            </Link>
          </Button>
        </div>

        {canEditBusiness && (
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/businesses/${business._id}/edit`} class="flex items-center gap-2">
                <Edit class="h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div class="lg:col-span-2 space-y-6">
          {/* Business Image */}
          <div class="relative h-64 md:h-80 overflow-hidden rounded-lg">
            <img
              src={business.image || '/placeholder-business.jpg'}
              alt={business.namePlace}
              class="w-full h-full object-cover"
            />
            <div class="absolute top-4 left-4">
              <Badge variant="secondary" class="bg-green-100 text-green-800">
                {business.typeBusiness}
              </Badge>
            </div>
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
              <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span class="font-semibold text-gray-900">
                {business.rating?.toFixed(1) || 'N/A'}
              </span>
              <span class="text-sm text-gray-600">
                ({business.numReviews || 0})
              </span>
            </div>
          </div>

          {/* Business Info */}
          <Card>
            <CardHeader>
              <CardTitle class="text-2xl">{business.namePlace}</CardTitle>
              <div class="flex items-center gap-2 text-gray-600">
                <MapPin class="h-4 w-4" />
                <span>{business.address}</span>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="flex items-center gap-6 text-sm text-gray-600">
                <div class="flex items-center gap-1">
                  <Users class="h-4 w-4" />
                  <span>{business.numReviews || 0} reviews</span>
                </div>
                <div class="flex items-center gap-1">
                  <Clock class="h-4 w-4" />
                  <span>{formatBusinessHours(business.hours)}</span>
                </div>
              </div>

              {business.budget && (
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-700">Presupuesto estimado:</span>
                  <Badge variant="outline" class="text-sm">
                    ${business.budget.toLocaleString()}
                  </Badge>
                </div>
              )}

              <div class="pt-4 border-t">
                <p class="text-sm text-gray-600 mb-2">Creado por:</p>
                <div class="flex items-center gap-2">
                  <img
                    src={business.author.photo || '/default-avatar.jpg'}
                    alt={business.author.username}
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span class="font-medium text-gray-900">{business.author.username}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center justify-between">
                <span>Reviews y Calificaciones</span>
                {isAuthenticated && !showReviewForm && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    size="sm"
                  >
                    Escribir Review
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewSystem
                resourceType="business"
                resourceId={business._id}
                reviews={business.reviews}
                showForm={showReviewForm}
                onFormCancel={() => setShowReviewForm(false)}
                onReviewSubmit={handleAddReview}
                isSubmitting={mutationLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contact Info */}
        <div class="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              {business.contact && business.contact.length > 0 && (
                <>
                  {business.contact[0].phone && (
                    <div class="flex items-center gap-3">
                      <Phone class="h-4 w-4 text-gray-500" />
                      <div>
                        <p class="text-sm font-medium text-gray-700">Teléfono</p>
                        <Button
                          variant="link"
                          class="p-0 h-auto text-blue-600 hover:text-blue-700"
                          onClick={() => window.location.href = `tel:${business.contact[0].phone}`}
                        >
                          {business.contact[0].phone}
                        </Button>
                      </div>
                    </div>
                  )}

                  {business.contact[0].email && (
                    <div class="flex items-center gap-3">
                      <Mail class="h-4 w-4 text-gray-500" />
                      <div>
                        <p class="text-sm font-medium text-gray-700">Email</p>
                        <Button
                          variant="link"
                          class="p-0 h-auto text-blue-600 hover:text-blue-700"
                          onClick={() => window.location.href = `mailto:${business.contact[0].email}`}
                        >
                          {business.contact[0].email}
                        </Button>
                      </div>
                    </div>
                  )}

                  {business.contact[0].website && (
                    <div class="flex items-center gap-3">
                      <Globe class="h-4 w-4 text-gray-500" />
                      <div>
                        <p class="text-sm font-medium text-gray-700">Sitio Web</p>
                        <Button
                          variant="link"
                          class="p-0 h-auto text-blue-600 hover:text-blue-700"
                          onClick={() => window.open(business.contact[0].website, '_blank')}
                        >
                          Visitar sitio web
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Quick Actions */}
              <div class="pt-4 border-t space-y-2">
                {business.contact?.[0]?.phone && (
                  <Button
                    variant="default"
                    class="w-full"
                    onClick={() => window.location.href = `tel:${business.contact[0].phone}`}
                  >
                    <Phone class="h-4 w-4 mr-2" />
                    Llamar Ahora
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  class="w-full"
                  onClick={() => {
                    const query = encodeURIComponent(`${business.namePlace} ${business.address}`);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                  }}
                >
                  <MapPin class="h-4 w-4 mr-2" />
                  Ver en Mapa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Horarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex items-center gap-2 text-sm">
                <Clock class="h-4 w-4 text-gray-500" />
                <span class="text-gray-700">{formatBusinessHours(business.hours)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Map Preview (if location available) */}
          {business.location && (
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p class="text-gray-500 text-sm">Mapa interactivo próximamente</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
```

### Paso 1.6: Crear Business Form Component

```typescript
// src/components/features/businesses/business-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, Phone, Mail, Globe, ImageIcon } from 'lucide-react';
import { useBusinessMutations } from '@/hooks/useBusinessMutations';
import { CreateBusinessData } from '@/lib/api/businesses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  'Tienda de Alimentos',
  'Restaurante', 
  'Café',
  'Panadería',
  'Suplementos',
  'Ropa y Accesorios',
  'Belleza y Cuidado',
  'Servicios',
  'Fitness y Bienestar',
  'Educación',
  'Otro'
];

interface BusinessFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CreateBusinessData>;
  onSuccess?: () => void;
}

export const BusinessForm = ({ mode, initialData, onSuccess }: BusinessFormProps) => {
  const router = useRouter();
  const { createBusiness, loading } = useBusinessMutations();
  
  const [formData, setFormData] = useState<CreateBusinessData>({
    namePlace: initialData?.namePlace || '',
    address: initialData?.address || '',
    location: initialData?.location || undefined,
    image: initialData?.image || '',
    contact: initialData?.contact || [{ phone: '', email: '', website: '' }],
    budget: initialData?.budget || 0,
    typeBusiness: initialData?.typeBusiness || '',
    hours: initialData?.hours || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.namePlace.trim()) {
      newErrors.namePlace = 'El nombre del negocio es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.typeBusiness) {
      newErrors.typeBusiness = 'El tipo de negocio es requerido';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'La imagen es requerida';
    }

    if (formData.budget < 0) {
      newErrors.budget = 'El presupuesto debe ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    try {
      if (mode === 'create') {
        const newBusiness = await createBusiness(formData);
        toast.success('Negocio creado exitosamente');
        router.push(`/businesses/${newBusiness._id}`);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(mode === 'create' ? 'Error al crear el negocio' : 'Error al actualizar el negocio');
    }
  };

  const handleInputChange = (field: keyof CreateBusinessData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleContactChange = (field: 'phone' | 'email' | 'website', value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: [{ ...prev.contact[0], [field]: value }]
    }));
  };

  return (
    <form onSubmit={handleSubmit} class="max-w-2xl mx-auto space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <MapPin class="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label htmlFor="namePlace">Nombre del Negocio *</Label>
            <Input
              id="namePlace"
              type="text"
              placeholder="Ej: Verde Market"
              value={formData.namePlace}
              onChange={(e) => handleInputChange('namePlace', e.target.value)}
              class={errors.namePlace ? 'border-red-500' : ''}
            />
            {errors.namePlace && (
              <p class="text-sm text-red-600">{errors.namePlace}</p>
            )}
          </div>

          <div class="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              type="text"
              placeholder="Ej: Calle 123 #45-67, Bogotá"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              class={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p class="text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div class="space-y-2">
            <Label htmlFor="typeBusiness">Tipo de Negocio *</Label>
            <Select
              value={formData.typeBusiness}
              onValueChange={(value) => handleInputChange('typeBusiness', value)}
            >
              <SelectTrigger class={errors.typeBusiness ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona el tipo de negocio" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.typeBusiness && (
              <p class="text-sm text-red-600">{errors.typeBusiness}</p>
            )}
          </div>

          <div class="space-y-2">
            <Label htmlFor="budget">Presupuesto Promedio (USD)</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              placeholder="Ej: 25"
              value={formData.budget || ''}
              onChange={(e) => handleInputChange('budget', Number(e.target.value) || 0)}
              class={errors.budget ? 'border-red-500' : ''}
            />
            {errors.budget && (
              <p class="text-sm text-red-600">{errors.budget}</p>
            )}
            <p class="text-sm text-gray-500">
              Presupuesto promedio por visita (opcional)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <ImageIcon class="h-5 w-5" />
            Imagen
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label htmlFor="image">URL de la Imagen *</Label>
            <Input
              id="image"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              class={errors.image ? 'border-red-500' : ''}
            />
            {errors.image && (
              <p class="text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          {formData.image && (
            <div class="mt-4">
              <Label>Vista Previa</Label>
              <div class="mt-2 h-48 overflow-hidden rounded-lg border">
                <img
                  src={formData.image}
                  alt="Preview"
                  class="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-business.jpg';
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label htmlFor="phone" class="flex items-center gap-2">
              <Phone class="h-4 w-4" />
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ej: +57 301 234 5678"
              value={formData.contact[0]?.phone || ''}
              onChange={(e) => handleContactChange('phone', e.target.value)}
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="email" class="flex items-center gap-2">
              <Mail class="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Ej: contacto@negocio.com"
              value={formData.contact[0]?.email || ''}
              onChange={(e) => handleContactChange('email', e.target.value)}
            />
          </div>

          <div class="space-y-2">
            <Label htmlFor="website" class="flex items-center gap-2">
              <Globe class="h-4 w-4" />
              Sitio Web
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="Ej: https://www.negocio.com"
              value={formData.contact[0]?.website || ''}
              onChange={(e) => handleContactChange('website', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div class="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} class="min-w-32">
          {loading ? (
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {mode === 'create' ? 'Creando...' : 'Actualizando...'}
            </div>
          ) : (
            mode === 'create' ? 'Crear Negocio' : 'Actualizar Negocio'
          )}
        </Button>
      </div>
    </form>
  );
};
```

### Paso 1.7: Crear Pages para Businesses

```typescript
// src/app/businesses/page.tsx
import { Metadata } from 'next';
import { BusinessList } from '@/components/features/businesses/business-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Negocios Veganos | Verde Guide',
  description: 'Descubre negocios veganos: tiendas, servicios, y más opciones para tu estilo de vida vegano.',
};

export default function BusinessesPage() {
  return (
    <div class="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Negocios Veganos</h1>
          <p class="text-gray-600 mt-2">
            Encuentra tiendas, servicios y negocios que apoyan el estilo de vida vegano
          </p>
        </div>
        
        <Button asChild>
          <Link href="/businesses/new" class="flex items-center gap-2">
            <Plus class="h-4 w-4" />
            Agregar Negocio
          </Link>
        </Button>
      </div>

      {/* Back to Home */}
      <div class="flex justify-start">
        <Button variant="outline" asChild>
          <Link href="/">← Volver al Inicio</Link>
        </Button>
      </div>

      {/* Business List */}
      <BusinessList />
    </div>
  );
}
```

```typescript
// src/app/businesses/[id]/page.tsx
import { Metadata } from 'next';
import { BusinessDetailClient } from '@/components/features/businesses/business-detail-client';
import { notFound } from 'next/navigation';

interface BusinessDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: BusinessDetailPageProps): Promise<Metadata> {
  return {
    title: `Negocio | Verde Guide`,
    description: 'Detalles del negocio vegano seleccionado.',
  };
}

export default function BusinessDetailPage({ params }: BusinessDetailPageProps) {
  if (!params.id) {
    notFound();
  }

  return (
    <div class="container mx-auto px-4 py-8">
      <BusinessDetailClient businessId={params.id} />
    </div>
  );
}
```

```typescript
// src/app/businesses/new/page.tsx
import { Metadata } from 'next';
import { BusinessForm } from '@/components/features/businesses/business-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Agregar Negocio | Verde Guide',
  description: 'Comparte un negocio vegano con la comunidad.',
};

export default function NewBusinessPage() {
  return (
    <div class="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/businesses" class="flex items-center gap-2">
            <ArrowLeft class="h-4 w-4" />
            Volver a Negocios
          </Link>
        </Button>
      </div>

      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold text-gray-900">Agregar Nuevo Negocio</h1>
        <p class="text-gray-600">
          Comparte un negocio vegano con la comunidad y ayuda a otros a descubrir lugares increíbles
        </p>
      </div>

      {/* Form */}
      <BusinessForm mode="create" />
    </div>
  );
}
```

---

## 🔄 FASE 2: Sistema de Reviews Mejorado (Semana 3)

### Paso 2.1: Crear Enhanced Review System Component

```typescript
// src/components/features/reviews/enhanced-review-system.tsx
'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Review } from '@/lib/api/reviews';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReviewForm } from './review-form';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface EnhancedReviewSystemProps {
  reviews: Review[];
  resourceType: string;
  resourceId: string;
  onReviewUpdate?: () => void;
  showStats?: boolean;
}

export const EnhancedReviewSystem = ({
  reviews,
  resourceType,
  resourceId,
  onReviewUpdate,
  showStats = true,
}: EnhancedReviewSystemProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const calculateStats = () => {
    if (reviews.length === 0) return null;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });

    return {
      averageRating,
      totalReviews: reviews.length,
      distribution,
    };
  };

  const stats = calculateStats();
  const userHasReviewed = isAuthenticated && reviews.some(review => review.user._id === user?.id);

  const handleHelpfulClick = async (reviewId: string, isCurrentlyHelpful: boolean) => {
    // Implement helpful voting logic
    console.log('Toggle helpful vote for review:', reviewId, !isCurrentlyHelpful);
    // Call API endpoint and refresh reviews
    onReviewUpdate?.();
  };

  const canEditReview = (review: Review) => {
    return user && (user.id === review.user._id || user.role === 'admin');
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta review?')) {
      // Implement delete logic
      console.log('Delete review:', reviewId);
      onReviewUpdate?.();
    }
  };

  return (
    <div class="space-y-6">
      {/* Review Stats */}
      {showStats && stats && (
        <Card>
          <CardContent class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div class="text-center">
                <div class="text-4xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                <div class="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      class={`h-5 w-5 ${
                        star <= Math.round(stats.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p class="text-sm text-gray-600">
                  Basado en {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div class="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} class="flex items-center gap-3">
                    <div class="flex items-center gap-1 min-w-16">
                      <span class="text-sm">{rating}</span>
                      <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-yellow-400 rounded-full h-2 transition-all"
                        style={{
                          width: `${
                            stats.totalReviews > 0
                              ? (stats.distribution[rating as keyof typeof stats.distribution] / stats.totalReviews) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span class="text-sm text-gray-600 min-w-8">
                      {stats.distribution[rating as keyof typeof stats.distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Review Button */}
      {isAuthenticated && !userHasReviewed && !showForm && (
        <div class="text-center">
          <Button onClick={() => setShowForm(true)}>
            Escribir Review
          </Button>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <h3 class="text-lg font-semibold">
              {editingReview ? 'Editar Review' : 'Escribir Review'}
            </h3>
          </CardHeader>
          <CardContent>
            <ReviewForm
              initialData={editingReview ? {
                rating: editingReview.rating,
                comment: editingReview.comment,
              } : undefined}
              onSubmit={async (data) => {
                // Handle review submission
                console.log('Submit review:', data);
                setShowForm(false);
                setEditingReview(null);
                onReviewUpdate?.();
              }}
              onCancel={() => {
                setShowForm(false);
                setEditingReview(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div class="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent class="p-8 text-center">
              <p class="text-gray-600">
                No hay reviews aún. ¡Sé el primero en compartir tu experiencia!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardContent class="p-4">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex items-start gap-3">
                    <Avatar class="h-10 w-10">
                      <AvatarImage src={review.user.photo} alt={review.user.username} />
                      <AvatarFallback>
                        {review.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-semibold text-gray-900">{review.user.username}</h4>
                        <div class="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              class={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p class="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Review Actions */}
                  {canEditReview(review) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical class="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditReview(review)}>
                          <Edit class="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteReview(review._id)}
                          class="text-red-600"
                        >
                          <Trash2 class="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Review Content */}
                <p class="text-gray-700 mb-4 leading-relaxed">{review.comment}</p>

                {/* Helpful Votes */}
                <div class="flex items-center justify-between pt-4 border-t">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-600">¿Te fue útil esta review?</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHelpfulClick(review._id, review.helpful?.includes(user?.id || ''))}
                      class={`flex items-center gap-1 ${
                        review.helpful?.includes(user?.id || '') ? 'text-green-600 bg-green-50' : ''
                      }`}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp class="h-4 w-4" />
                      <span>{review.helpfulCount || 0}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
```

### Paso 2.2: Crear Review Form Component

```typescript
// src/components/features/reviews/review-form.tsx
'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ReviewFormData {
  rating: number;
  comment: string;
}

interface ReviewFormProps {
  initialData?: ReviewFormData;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ReviewForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: ReviewFormProps) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [comment, setComment] = useState(initialData?.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (rating === 0) {
      newErrors.rating = 'Por favor selecciona una calificación';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Por favor escribe un comentario';
    } else if (comment.trim().length < 10) {
      newErrors.comment = 'El comentario debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({ rating, comment: comment.trim() });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-6">
      {/* Rating Selection */}
      <div class="space-y-2">
        <Label>Calificación *</Label>
        <div class="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              class="p-1 rounded transition-colors hover:bg-gray-100"
            >
              <Star
                class={`h-8 w-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p class="text-sm text-gray-600">
            {rating === 1 && 'Muy malo'}
            {rating === 2 && 'Malo'}
            {rating === 3 && 'Regular'}
            {rating === 4 && 'Bueno'}
            {rating === 5 && 'Excelente'}
          </p>
        )}
        {errors.rating && (
          <p class="text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Comment */}
      <div class="space-y-2">
        <Label htmlFor="comment">Comentario *</Label>
        <Textarea
          id="comment"
          rows={4}
          placeholder="Comparte tu experiencia... ¿Qué te gustó? ¿Qué mejorarías? ¿Lo recomendarías?"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (errors.comment) {
              setErrors(prev => ({ ...prev, comment: '' }));
            }
          }}
          class={`resize-none ${errors.comment ? 'border-red-500' : ''}`}
        />
        <div class="flex justify-between text-sm text-gray-500">
          <span>{comment.length}/500 caracteres</span>
          {errors.comment && (
            <span class="text-red-600">{errors.comment}</span>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div class="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          class="min-w-24"
        >
          {isSubmitting ? (
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </div>
          ) : (
            initialData ? 'Actualizar Review' : 'Publicar Review'
          )}
        </Button>
      </div>
    </form>
  );
};
```

---

## 🔍 FASE 3: Búsqueda Avanzada & Geoespacial (Semana 4)

### Paso 3.1: Crear Advanced Search Component

```typescript
// src/components/features/search/advanced-search.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { SearchResults } from './search-results';

interface SearchFilters {
  query: string;
  resourceTypes: string[];
  location: string;
  radius: number; // in kilometers
  minRating: number;
  sortBy: 'relevance' | 'rating' | 'distance' | 'newest';
  coordinates?: [number, number];
}

const RESOURCE_TYPES = [
  { id: 'restaurants', label: 'Restaurantes', icon: '🍽️' },
  { id: 'recipes', label: 'Recetas', icon: '👨‍🍳' },
  { id: 'markets', label: 'Mercados', icon: '🛒' },
  { id: 'doctors', label: 'Doctores', icon: '👩‍⚕️' },
  { id: 'businesses', label: 'Negocios', icon: '🏪' },
  { id: 'sanctuaries', label: 'Santuarios', icon: '🐄' },
  { id: 'posts', label: 'Posts', icon: '📝' },
];

export const AdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    resourceTypes: [],
    location: '',
    radius: 10,
    minRating: 0,
    sortBy: 'relevance',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const { searchResults, loading, error, performSearch } = useAdvancedSearch();

  useEffect(() => {
    // Auto-search when filters change (debounced)
    const timeoutId = setTimeout(() => {
      if (filters.query.trim() || filters.resourceTypes.length > 0) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.query]);

  const handleSearch = async () => {
    setIsSearching(true);
    await performSearch(filters);
    setIsSearching(false);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResourceTypeToggle = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      resourceTypes: checked
        ? [...prev.resourceTypes, type]
        : prev.resourceTypes.filter(t => t !== type)
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      resourceTypes: [],
      location: '',
      radius: 10,
      minRating: 0,
      sortBy: 'relevance',
    });
  };

  const getLocationPermission = async () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en este navegador');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFilters(prev => ({
          ...prev,
          coordinates: [latitude, longitude],
          location: 'Mi ubicación actual'
        }));
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener la ubicación. Por favor, ingresa una dirección manualmente.');
      }
    );
  };

  const activeFiltersCount = [
    filters.resourceTypes.length > 0,
    filters.location,
    filters.minRating > 0,
    filters.sortBy !== 'relevance'
  ].filter(Boolean).length;

  return (
    <div class="space-y-6">
      {/* Main Search */}
      <Card>
        <CardContent class="p-6">
          <div class="flex gap-4 mb-4">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar restaurantes, recetas, doctores, negocios..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                class="pl-10 text-lg h-12"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              class="flex items-center gap-2 h-12 px-4"
            >
              <Filter class="h-5 w-5" />
              Filtros Avanzados
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" class="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Quick Resource Type Filters */}
          <div class="flex flex-wrap gap-2">
            {RESOURCE_TYPES.map((type) => (
              <Button
                key={type.id}
                variant={filters.resourceTypes.includes(type.id) ? "default" : "outline"}
                size="sm"
                onClick={() => 
                  handleResourceTypeToggle(type.id, !filters.resourceTypes.includes(type.id))
                }
                class="flex items-center gap-2"
              >
                <span>{type.icon}</span>
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Filter class="h-5 w-5" />
              Filtros Avanzados
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            {/* Location Search */}
            <div class="space-y-4">
              <h4 class="font-semibold text-gray-900">Ubicación</h4>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <MapPin class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Ciudad, dirección o código postal"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    class="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={getLocationPermission}
                  class="flex items-center gap-2"
                >
                  <MapPin class="h-4 w-4" />
                  Usar mi ubicación
                </Button>
              </div>

              {/* Radius Selection */}
              {filters.location && (
                <div class="space-y-2">
                  <label class="text-sm font-medium text-gray-700">Radio de búsqueda</label>
                  <Select
                    value={filters.radius.toString()}
                    onValueChange={(value) => handleFilterChange('radius', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 km</SelectItem>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="25">25 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            {/* Rating Filter */}
            <div class="space-y-2">
              <h4 class="font-semibold text-gray-900">Calificación mínima</h4>
              <div class="flex gap-2">
                {[0, 3, 4, 4.5].map((rating) => (
                  <Button
                    key={rating}
                    variant={filters.minRating === rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('minRating', rating)}
                    class="flex items-center gap-1"
                  >
                    <Star class="h-4 w-4" />
                    {rating === 0 ? 'Cualquiera' : `${rating}+`}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Sort Options */}
            <div class="space-y-2">
              <h4 class="font-semibold text-gray-900">Ordenar por</h4>
              <Select
                value={filters.sortBy}
                onValueChange={(value: any) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevancia</SelectItem>
                  <SelectItem value="rating">Mejor calificados</SelectItem>
                  <SelectItem value="distance">Más cercanos</SelectItem>
                  <SelectItem value="newest">Más recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div class="flex justify-end">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div class="flex flex-wrap gap-2">
          {filters.resourceTypes.map((type) => {
            const resourceType = RESOURCE_TYPES.find(t => t.id === type);
            return (
              <Badge key={type} variant="secondary" class="flex items-center gap-1">
                <span>{resourceType?.icon}</span>
                {resourceType?.label}
                <button
                  onClick={() => handleResourceTypeToggle(type, false)}
                  class="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            );
          })}
          {filters.location && (
            <Badge variant="secondary" class="flex items-center gap-1">
              <MapPin class="h-3 w-3" />
              {filters.location} ({filters.radius}km)
              <button
                onClick={() => handleFilterChange('location', '')}
                class="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="secondary" class="flex items-center gap-1">
              <Star class="h-3 w-3" />
              {filters.minRating}+ estrellas
              <button
                onClick={() => handleFilterChange('minRating', 0)}
                class="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Search Results */}
      <SearchResults
        results={searchResults}
        loading={loading || isSearching}
        error={error}
        query={filters.query}
        totalFilters={activeFiltersCount}
        onClearFilters={clearFilters}
      />
    </div>
  );
};
```

### Paso 3.2: Crear Search Results Component

```typescript
// src/components/features/search/search-results.tsx
'use client';

import Link from 'next/link';
import { MapPin, Star, Users, Clock, ChefHat, Stethoscope, Store, Heart, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchResult {
  id: string;
  type: 'restaurant' | 'recipe' | 'market' | 'doctor' | 'business' | 'sanctuary' | 'post';
  title: string;
  description?: string;
  image?: string;
  rating?: number;
  numReviews?: number;
  address?: string;
  distance?: number; // in km
  author?: {
    username: string;
    photo?: string;
  };
  createdAt?: string;
  tags?: string[];
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  totalFilters: number;
  onClearFilters: () => void;
}

const getResourceIcon = (type: string) => {
  const icons = {
    restaurant: <ChefHat class="h-5 w-5" />,
    recipe: <ChefHat class="h-5 w-5" />,
    market: <Store class="h-5 w-5" />,
    doctor: <Stethoscope class="h-5 w-5" />,
    business: <Store class="h-5 w-5" />,
    sanctuary: <Heart class="h-5 w-5" />,
    post: <MessageSquare class="h-5 w-5" />,
  };
  return icons[type as keyof typeof icons] || <Store class="h-5 w-5" />;
};

const getResourceColor = (type: string) => {
  const colors = {
    restaurant: 'bg-orange-100 text-orange-800',
    recipe: 'bg-green-100 text-green-800',
    market: 'bg-blue-100 text-blue-800',
    doctor: 'bg-purple-100 text-purple-800',
    business: 'bg-yellow-100 text-yellow-800',
    sanctuary: 'bg-pink-100 text-pink-800',
    post: 'bg-gray-100 text-gray-800',
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getResourcePath = (type: string) => {
  const paths = {
    restaurant: '/restaurants',
    recipe: '/recipes',
    market: '/markets',
    doctor: '/doctors',
    business: '/businesses',
    sanctuary: '/sanctuaries',
    post: '/community',
  };
  return paths[type as keyof typeof paths] || '/';
};

export const SearchResults = ({
  results,
  loading,
  error,
  query,
  totalFilters,
  onClearFilters,
}: SearchResultsProps) => {
  if (loading) {
    return (
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <Skeleton class="h-6 w-48" />
          <Skeleton class="h-4 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent class="p-4">
              <div class="flex gap-4">
                <Skeleton class="h-20 w-20 rounded-lg" />
                <div class="flex-1 space-y-3">
                  <div class="flex items-center gap-2">
                    <Skeleton class="h-4 w-16" />
                    <Skeleton class="h-6 w-48" />
                  </div>
                  <Skeleton class="h-4 w-full" />
                  <div class="flex items-center gap-4">
                    <Skeleton class="h-4 w-20" />
                    <Skeleton class="h-4 w-24" />
                    <Skeleton class="h-4 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card class="p-8 text-center">
        <p class="text-red-600 mb-4">Error en la búsqueda: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </Card>
    );
  }

  if (!query && totalFilters === 0) {
    return (
      <Card class="p-8 text-center">
        <div class="text-gray-400 mb-4">
          <Store class="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          Encuentra todo lo que necesitas
        </h3>
        <p class="text-gray-600 mb-4">
          Busca restaurantes, recetas, doctores, negocios y más contenido vegano
        </p>
        <p class="text-sm text-gray-500">
          Escribe en el buscador o selecciona filtros para comenzar
        </p>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card class="p-8 text-center">
        <div class="text-gray-400 mb-4">
          <Store class="h-16 w-16 mx-auto mb-4" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          No se encontraron resultados
        </h3>
        <p class="text-gray-600 mb-4">
          No encontramos contenido que coincida con tu búsqueda{' '}
          {query && <span class="font-semibold">"{query}"</span>}
        </p>
        <div class="space-y-2 text-sm text-gray-500">
          <p>Intenta:</p>
          <ul class="list-disc list-inside space-y-1">
            <li>Verificar la ortografía</li>
            <li>Usar palabras más generales</li>
            <li>Reducir los filtros aplicados</li>
            <li>Buscar en diferentes categorías</li>
          </ul>
        </div>
        {totalFilters > 0 && (
          <Button variant="outline" onClick={onClearFilters} class="mt-4">
            Limpiar filtros
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div class="space-y-4">
      {/* Results Header */}
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">
          Resultados de búsqueda
          {query && (
            <span class="font-normal text-gray-600"> para "{query}"</span>
          )}
        </h3>
        <p class="text-sm text-gray-600">
          {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Results List */}
      <div class="space-y-3">
        {results.map((result) => (
          <Card key={`${result.type}-${result.id}`} class="hover:shadow-md transition-shadow">
            <CardContent class="p-4">
              <Link href={`${getResourcePath(result.type)}/${result.id}`} class="block">
                <div class="flex gap-4">
                  {/* Image */}
                  <div class="flex-shrink-0">
                    <img
                      src={result.image || '/placeholder-search.jpg'}
                      alt={result.title}
                      class="h-20 w-20 rounded-lg object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div class="flex-1 min-w-0 space-y-2">
                    {/* Title and Type */}
                    <div class="flex items-start gap-3">
                      <Badge 
                        variant="secondary" 
                        class={`flex items-center gap-1 ${getResourceColor(result.type)}`}
                      >
                        {getResourceIcon(result.type)}
                        {result.type === 'restaurant' && 'Restaurante'}
                        {result.type === 'recipe' && 'Receta'}
                        {result.type === 'market' && 'Mercado'}
                        {result.type === 'doctor' && 'Doctor'}
                        {result.type === 'business' && 'Negocio'}
                        {result.type === 'sanctuary' && 'Santuario'}
                        {result.type === 'post' && 'Post'}
                      </Badge>
                      <h4 class="font-semibold text-gray-900 line-clamp-1 flex-1">
                        {result.title}
                      </h4>
                    </div>

                    {/* Description */}
                    {result.description && (
                      <p class="text-sm text-gray-600 line-clamp-2">
                        {result.description}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div class="flex items-center gap-4 text-sm text-gray-600">
                      {/* Rating */}
                      {result.rating !== undefined && (
                        <div class="flex items-center gap-1">
                          <Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span class="font-medium">{result.rating.toFixed(1)}</span>
                          {result.numReviews !== undefined && (
                            <span class="text-gray-500">({result.numReviews})</span>
                          )}
                        </div>
                      )}

                      {/* Address */}
                      {result.address && (
                        <div class="flex items-center gap-1">
                          <MapPin class="h-4 w-4" />
                          <span class="truncate">{result.address}</span>
                        </div>
                      )}

                      {/* Distance */}
                      {result.distance !== undefined && (
                        <div class="flex items-center gap-1">
                          <MapPin class="h-4 w-4" />
                          <span>{result.distance.toFixed(1)} km</span>
                        </div>
                      )}

                      {/* Author for posts/recipes */}
                      {result.author && (
                        <div class="flex items-center gap-1">
                          <span>por {result.author.username}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {result.tags && result.tags.length > 0 && (
                      <div class="flex flex-wrap gap-1">
                        {result.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" class="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {result.tags.length > 3 && (
                          <Badge variant="outline" class="text-xs">
                            +{result.tags.length - 3} más
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
```

### Paso 3.3: Crear Hook para Advanced Search

```typescript
// src/hooks/useAdvancedSearch.ts
import { useState } from 'react';
import { apiRequest } from '@/lib/api/config';

interface SearchFilters {
  query: string;
  resourceTypes: string[];
  location: string;
  radius: number;
  minRating: number;
  sortBy: 'relevance' | 'rating' | 'distance' | 'newest';
  coordinates?: [number, number];
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  image?: string;
  rating?: number;
  numReviews?: number;
  address?: string;
  distance?: number;
  author?: {
    username: string;
    photo?: string;
  };
  createdAt?: string;
  tags?: string[];
}

export function useAdvancedSearch() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (filters: SearchFilters) => {
    if (!filters.query.trim() && filters.resourceTypes.length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build search parameters
      const searchParams = new URLSearchParams();
      if (filters.query.trim()) searchParams.append('q', filters.query.trim());
      if (filters.resourceTypes.length > 0) {
        searchParams.append('types', filters.resourceTypes.join(','));
      }
      if (filters.location) searchParams.append('location', filters.location);
      if (filters.coordinates) {
        searchParams.append('lat', filters.coordinates[0].toString());
        searchParams.append('lng', filters.coordinates[1].toString());
      }
      if (filters.radius) searchParams.append('radius', filters.radius.toString());
      if (filters.minRating > 0) searchParams.append('minRating', filters.minRating.toString());
      if (filters.sortBy) searchParams.append('sortBy', filters.sortBy);

      // For now, we'll search each resource type individually since we don't have a unified search endpoint
      const results: SearchResult[] = [];

      // Search restaurants
      if (filters.resourceTypes.length === 0 || filters.resourceTypes.includes('restaurants')) {
        try {
          const restaurantParams = new URLSearchParams();
          if (filters.query) restaurantParams.append('search', filters.query);
          if (filters.minRating > 0) restaurantParams.append('rating', filters.minRating.toString());

          const restaurantResponse = await apiRequest(`/restaurants?${restaurantParams.toString()}`);
          const restaurants = restaurantResponse.data || [];
          
          results.push(...restaurants.map((restaurant: any) => ({
            id: restaurant._id,
            type: 'restaurant',
            title: restaurant.restaurantName || restaurant.name,
            description: `${restaurant.cuisine?.join(', ') || 'Restaurante vegano'} • ${restaurant.address}`,
            image: restaurant.image,
            rating: restaurant.rating,
            numReviews: restaurant.numReviews,
            address: restaurant.address,
            tags: restaurant.cuisine,
          })));
        } catch (err) {
          console.warn('Error searching restaurants:', err);
        }
      }

      // Search recipes
      if (filters.resourceTypes.length === 0 || filters.resourceTypes.includes('recipes')) {
        try {
          const recipeParams = new URLSearchParams();
          if (filters.query) recipeParams.append('search', filters.query);

          const recipeResponse = await apiRequest(`/recipes?${recipeParams.toString()}`);
          const recipes = recipeResponse.data || [];
          
          results.push(...recipes.map((recipe: any) => ({
            id: recipe._id,
            type: 'recipe',
            title: recipe.title,
            description: recipe.description,
            image: recipe.image,
            rating: recipe.rating,
            numReviews: recipe.numReviews,
            author: recipe.author,
            tags: recipe.tags,
          })));
        } catch (err) {
          console.warn('Error searching recipes:', err);
        }
      }

      // Search markets
      if (filters.resourceTypes.length === 0 || filters.resourceTypes.includes('markets')) {
        try {
          const marketParams = new URLSearchParams();
          if (filters.query) marketParams.append('search', filters.query);

          const marketResponse = await apiRequest(`/markets?${marketParams.toString()}`);
          const markets = marketResponse.data || [];
          
          results.push(...markets.map((market: any) => ({
            id: market._id,
            type: 'market',
            title: market.marketName,
            description: `${market.marketType || 'Mercado'} • ${market.address}`,
            image: market.image,
            rating: market.rating,
            numReviews: market.numReviews,
            address: market.address,
          })));
        } catch (err) {
          console.warn('Error searching markets:', err);
        }
      }

      // Search doctors
      if (filters.resourceTypes.length === 0 || filters.resourceTypes.includes('doctors')) {
        try {
          const doctorParams = new URLSearchParams();
          if (filters.query) doctorParams.append('search', filters.query);

          const doctorResponse = await apiRequest(`/doctors?${doctorParams.toString()}`);
          const doctors = doctorResponse.data || [];
          
          results.push(...doctors.map((doctor: any) => ({
            id: doctor._id,
            type: 'doctor',
            title: doctor.doctorName,
            description: `${doctor.specialty || 'Médico'} • ${doctor.address}`,
            image: doctor.image,
            rating: doctor.rating,
            numReviews: doctor.numReviews,
            address: doctor.address,
          })));
        } catch (err) {
          console.warn('Error searching doctors:', err);
        }
      }

      // Search businesses
      if (filters.resourceTypes.length === 0 || filters.resourceTypes.includes('businesses')) {
        try {
          const businessParams = new URLSearchParams();
          if (filters.query) businessParams.append('search', filters.query);

          const businessResponse = await apiRequest(`/businesses?${businessParams.toString()}`);
          const businesses = businessResponse.data || [];
          
          results.push(...businesses.map((business: any) => ({
            id: business._id,
            type: 'business',
            title: business.namePlace,
            description: `${business.typeBusiness} • ${business.address}`,
            image: business.image,
            rating: business.rating,
            numReviews: business.numReviews,
            address: business.address,
          })));
        } catch (err) {
          console.warn('Error searching businesses:', err);
        }
      }

      // Search posts
      if (filters.resourceTypes.length === 0 || filters.resourceTypes.includes('posts')) {
        try {
          const postParams = new URLSearchParams();
          if (filters.query) postParams.append('search', filters.query);

          const postResponse = await apiRequest(`/posts?${postParams.toString()}`);
          const posts = postResponse.data || [];
          
          results.push(...posts.map((post: any) => ({
            id: post._id,
            type: 'post',
            title: post.title,
            description: post.content.substring(0, 150) + '...',
            author: post.author,
            tags: post.tags,
            createdAt: post.createdAt,
          })));
        } catch (err) {
          console.warn('Error searching posts:', err);
        }
      }

      // Sort results based on sortBy parameter
      let sortedResults = [...results];
      switch (filters.sortBy) {
        case 'rating':
          sortedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case 'newest':
          sortedResults.sort((a, b) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          break;
        case 'distance':
          // Would need geolocation calculation
          break;
        default: // relevance
          // Keep original order or implement relevance scoring
          break;
      }

      setSearchResults(sortedResults);
    } catch (err: any) {
      console.error('Error performing advanced search:', err);
      setError(err.message || 'Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  return {
    searchResults,
    loading,
    error,
    performSearch,
  };
}
```

---

## 🧪 FASE 4: Testing & Polish (Semanas 5-6)

### Paso 4.1: Testing Strategy

```bash
# Crear archivo de testing para businesses
# src/components/features/businesses/__tests__/business-list.test.tsx

# Crear archivo de testing para reviews
# src/components/features/reviews/__tests__/enhanced-review-system.test.tsx

# Crear archivo de testing para search
# src/components/features/search/__tests__/advanced-search.test.tsx
```

### Paso 4.2: Performance Optimizations

```typescript
// src/lib/utils/performance.ts
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, delay);
    }
  };
};
```

---

## 📋 Checklist de Implementación

### ✅ Fase 1: Businesses Section (Semanas 1-2)
- [ ] Crear API client para reviews (mejorado)
- [ ] Implementar hook `useBusinesses`
- [ ] Crear `BusinessCard` component
- [ ] Crear `BusinessList` component con filtros avanzados
- [ ] Crear `BusinessDetailClient` component
- [ ] Crear `BusinessForm` component
- [ ] Crear páginas: `/businesses`, `/businesses/[id]`, `/businesses/new`
- [ ] Agregar navegación en el menú principal
- [ ] Testing básico de componentes

### ✅ Fase 2: Enhanced Reviews (Semana 3)
- [ ] Crear `EnhancedReviewSystem` component
- [ ] Crear `ReviewForm` component
- [ ] Implementar sistema de votos útiles
- [ ] Integrar con todos los recursos existentes
- [ ] Crear página de gestión de reviews `/reviews`
- [ ] Testing del sistema de reviews

### ✅ Fase 3: Advanced Search (Semana 4)
- [ ] Crear `AdvancedSearch` component
- [ ] Crear `SearchResults` component
- [ ] Implementar hook `useAdvancedSearch`
- [ ] Agregar filtros geoespaciales
- [ ] Integrar búsqueda unificada
- [ ] Optimizar performance con debouncing
- [ ] Testing de búsqueda avanzada

### ✅ Fase 4: Polish & Testing (Semanas 5-6)
- [ ] Testing integral E2E
- [ ] Optimizaciones de performance
- [ ] Mejoras de UX/UI
- [ ] Documentación de componentes
- [ ] Preparar deploy
- [ ] Monitoreo y analytics

---

## 🔧 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Testing
npm test
npm run test:watch
npm run test:coverage

# Linting y Type Checking
npm run lint
npm run type-check

# Build para producción
npm run build
npm start
```

---

## 📚 Recursos Adicionales

### APIs Útiles para Geolocalización
- Google Maps Geocoding API
- OpenStreetMap Nominatim
- Mapbox Geocoding API

### Librerías Recomendadas
- `date-fns` - Manejo de fechas
- `react-query` - Cache y sincronización de datos
- `framer-motion` - Animaciones
- `react-hook-form` - Formularios optimizados

### Performance Tips
- Implementar lazy loading para imágenes
- Usar React.memo para componentes pesados
- Implementar virtualization para listas largas
- Optimizar imágenes con Next.js Image

---

## 🎯 Métricas de Éxito

### KPIs a Medir
1. **Adopción de Nuevas Features**
   - % usuarios que usan la sección Businesses
   - Cantidad de businesses creados por mes
   - Engagement con sistema de reviews mejorado

2. **Search Performance**
   - Tiempo promedio de búsqueda
   - % búsquedas que resultan en clicks
   - Uso de filtros geoespaciales

3. **User Experience**
   - Tiempo en página
   - Bounce rate en nuevas secciones
   - Conversion rate (visitas → acciones)

### Objetivos Cuantitativos (3 meses)
- 100+ nuevos businesses en la plataforma
- 30% incremento en reviews por recurso
- 50% de búsquedas usando filtros avanzados
- <2s tiempo de carga promedio

---

Esta guía te proporcionará una implementación robusta y escalable de las funcionalidades faltantes, maximizando el valor de tu API existente y mejorando significativamente la experiencia del usuario en Verde Guide.