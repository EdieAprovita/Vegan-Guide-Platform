"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Star, AlertTriangle, CheckCircle, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "./review-card";
// import { ReviewStats } from './review-stats'; // TODO: Implement stats component
import { Review } from "@/lib/api/reviews";

interface ReviewsManagementProps {
  showStats?: boolean;
}

interface ReviewWithResource extends Review {
  resourceType: "restaurant" | "recipe" | "market" | "doctor" | "business" | "sanctuary";
  resourceId: string;
  resourceName?: string;
}

export const ReviewsManagement = ({ showStats = true }: ReviewsManagementProps) => {
  // const { user, isAuthenticated } = useAuthStore(); // TODO: Use auth state when needed
  const [reviews, setReviews] = useState<ReviewWithResource[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    pendingModeration: 0,
    reportedReviews: 0,
  });

  const RESOURCE_TYPES = [
    { id: "all", label: "Todos los recursos", icon: "🌐" },
    { id: "restaurant", label: "Restaurantes", icon: "🍽️" },
    { id: "recipe", label: "Recetas", icon: "👨‍🍳" },
    { id: "market", label: "Mercados", icon: "🛒" },
    { id: "doctor", label: "Doctores", icon: "👩‍⚕️" },
    { id: "business", label: "Negocios", icon: "🏪" },
    { id: "sanctuary", label: "Santuarios", icon: "🐄" },
    { id: "post", label: "Posts", icon: "📝" },
  ];

  const RATING_OPTIONS = [
    { value: "all", label: "Todas las calificaciones" },
    { value: "5", label: "5 estrellas" },
    { value: "4", label: "4+ estrellas" },
    { value: "3", label: "3+ estrellas" },
    { value: "2", label: "2+ estrellas" },
    { value: "1", label: "1+ estrellas" },
  ];

  const STATUS_OPTIONS = [
    { value: "all", label: "Todos los estados" },
    { value: "pending", label: "Pendientes de moderación" },
    { value: "reported", label: "Reportados" },
    { value: "approved", label: "Aprobados" },
  ];

  const SORT_OPTIONS = [
    { value: "newest", label: "Más recientes" },
    { value: "oldest", label: "Más antiguos" },
    { value: "rating", label: "Mejor calificados" },
    { value: "helpful", label: "Más útiles" },
    { value: "reported", label: "Más reportados" },
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data - replace with actual API calls
        const mockReviews: ReviewWithResource[] = [
          {
            _id: "1",
            user: {
              _id: "user1",
              username: "maria_vegana",
              photo: "/default-avatar.jpg",
            },
            rating: 5,
            comment:
              "Excelente restaurante vegano! La comida es deliciosa y el ambiente muy acogedor. Definitivamente volveré.",
            resourceType: "restaurant",
            resourceId: "rest1",
            resourceName: "Verde Bistro",
            helpful: ["user2", "user3"],
            helpfulCount: 2,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "2",
            user: {
              _id: "user2",
              username: "carlos_eco",
              photo: "/default-avatar.jpg",
            },
            rating: 4,
            comment:
              "Muy buena receta, fácil de preparar y muy sabrosa. La recomiendo para principiantes.",
            resourceType: "recipe",
            resourceId: "recipe1",
            resourceName: "Bowl de Quinoa",
            helpful: ["user1"],
            helpfulCount: 1,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            _id: "3",
            user: {
              _id: "user3",
              username: "ana_salud",
              photo: "/default-avatar.jpg",
            },
            rating: 3,
            comment:
              "El mercado tiene buena variedad de productos orgánicos, pero los precios son un poco altos.",
            resourceType: "market",
            resourceId: "market1",
            resourceName: "Mercado Orgánico",
            helpful: [],
            helpfulCount: 0,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];

        setReviews(mockReviews);
        setFilteredReviews(mockReviews);

        // Calculate stats
        const totalRating = mockReviews.reduce((sum, review) => sum + review.rating, 0);
        setStats({
          totalReviews: mockReviews.length,
          averageRating: totalRating / mockReviews.length,
          pendingModeration: 0,
          reportedReviews: 0,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error al cargar las reviews");
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...reviews];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (review) =>
          review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (review.resourceName &&
            review.resourceName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Resource type filter
    if (resourceTypeFilter !== "all") {
      filtered = filtered.filter((review) => review.resourceType === resourceTypeFilter);
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const minRating = parseInt(ratingFilter);
      filtered = filtered.filter((review) => review.rating >= minRating);
    }

    // Status filter (mock implementation)
    if (statusFilter === "reported") {
      filtered = filtered.filter((review) => review.helpfulCount === 0); // Mock logic
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "rating":
          return b.rating - a.rating;
        case "helpful":
          return b.helpfulCount - a.helpfulCount;
        default:
          return 0;
      }
    });

    setFilteredReviews(filtered);
  }, [reviews, searchQuery, resourceTypeFilter, ratingFilter, statusFilter, sortBy]);

  const handleReviewUpdate = () => {
    // Refresh reviews after update
    console.log("Review updated, refreshing...");
  };

  const handleReviewDelete = (reviewId: string) => {
    setReviews((prev) => prev.filter((review) => review._id !== reviewId));
    setFilteredReviews((prev) => prev.filter((review) => review._id !== reviewId));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setResourceTypeFilter("all");
    setRatingFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
  };

  const activeFiltersCount = [
    searchQuery,
    resourceTypeFilter !== "all",
    ratingFilter !== "all",
    statusFilter !== "all",
    sortBy !== "newest",
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-8 rounded bg-gray-200"></div>
                  <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded bg-gray-200"></div>
                      <div className="h-3 w-24 rounded bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-gray-200"></div>
                    <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Error al cargar las reviews</h3>
        <p className="mb-4 text-gray-600">{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {showStats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="mb-2 text-2xl font-bold text-blue-600">{stats.totalReviews}</div>
              <div className="mb-2 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Total de Reviews</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="mb-2 text-2xl font-bold text-yellow-600">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="mb-2 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600">Calificación Promedio</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="mb-2 text-2xl font-bold text-orange-600">
                {stats.pendingModeration}
              </div>
              <div className="mb-2 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Pendientes de Moderación</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="mb-2 text-2xl font-bold text-red-600">{stats.reportedReviews}</div>
              <div className="mb-2 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-sm text-gray-600">Reviews Reportados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar en reviews, usuarios o recursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={clearFilters} disabled={activeFiltersCount === 0}>
              Limpiar Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de Recurso</label>
              <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <span className="mr-2">{type.icon}</span>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Calificación</label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Todas ({filteredReviews.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recientes
          </TabsTrigger>
          <TabsTrigger value="top" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Mejor Calificadas
          </TabsTrigger>
          <TabsTrigger value="helpful" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Más Útiles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {filteredReviews.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No se encontraron reviews con los filtros aplicados.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-2">
                Limpiar Filtros
              </Button>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                resourceType={review.resourceType}
                resourceId={review.resourceId}
                onReviewUpdate={handleReviewUpdate}
                onReviewDelete={handleReviewDelete}
                showActions={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6 space-y-4">
          {filteredReviews
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10)
            .map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                resourceType={review.resourceType}
                resourceId={review.resourceId}
                onReviewUpdate={handleReviewUpdate}
                onReviewDelete={handleReviewDelete}
                showActions={true}
              />
            ))}
        </TabsContent>

        <TabsContent value="top" className="mt-6 space-y-4">
          {filteredReviews
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10)
            .map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                resourceType={review.resourceType}
                resourceId={review.resourceId}
                onReviewUpdate={handleReviewUpdate}
                onReviewDelete={handleReviewDelete}
                showActions={true}
              />
            ))}
        </TabsContent>

        <TabsContent value="helpful" className="mt-6 space-y-4">
          {filteredReviews
            .sort((a, b) => b.helpfulCount - a.helpfulCount)
            .slice(0, 10)
            .map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                resourceType={review.resourceType}
                resourceId={review.resourceId}
                onReviewUpdate={handleReviewUpdate}
                onReviewDelete={handleReviewDelete}
                showActions={true}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
