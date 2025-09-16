"use client";

import { Star, ThumbsUp, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ReviewStatsProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
  helpfulVotes: number;
  totalVotes: number;
  showDetails?: boolean;
}

export const ReviewStats = ({
  averageRating,
  totalReviews,
  ratingDistribution,
  helpfulVotes,
  totalVotes,
  showDetails = true,
}: ReviewStatsProps) => {
  const helpfulPercentage = totalVotes > 0 ? (helpfulVotes / totalVotes) * 100 : 0;
  const topRating = Math.max(...Object.values(ratingDistribution));

  const getRatingLabel = (rating: number) => {
    const labels = {
      5: "Excelente",
      4: "Muy bueno",
      3: "Bueno",
      2: "Regular",
      1: "Malo",
    };
    return labels[rating as keyof typeof labels] || "";
  };

  const getRatingColor = (rating: number) => {
    const colors = {
      5: "text-green-600",
      4: "text-blue-600",
      3: "text-yellow-600",
      2: "text-orange-600",
      1: "text-red-600",
    };
    return colors[rating as keyof typeof colors] || "text-gray-600";
  };

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Overall Rating */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2 text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <div className="mb-2 flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Basado en {totalReviews} review{totalReviews !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2 text-3xl font-bold text-blue-600">{totalReviews}</div>
            <div className="mb-2 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total de reviews</p>
          </CardContent>
        </Card>

        {/* Helpful Votes */}
        <Card>
          <CardContent className="p-4 text-center">
            <div className="mb-2 text-3xl font-bold text-green-600">{helpfulVotes}</div>
            <div className="mb-2 flex items-center justify-center">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Votos útiles ({helpfulPercentage.toFixed(0)}%)</p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribución de Calificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              const isTopRating = count === topRating && count > 0;

              return (
                <div key={rating} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-32 items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{rating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                      {isTopRating && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-xs text-yellow-800"
                        >
                          Más común
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            rating >= 4
                              ? "bg-green-500"
                              : rating >= 3
                                ? "bg-yellow-500"
                                : rating >= 2
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex min-w-16 items-center gap-2">
                        <span className={`text-sm font-medium ${getRatingColor(rating)}`}>
                          {count}
                        </span>
                        <span className="text-sm text-gray-500">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={getRatingColor(rating)}>{getRatingLabel(rating)}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Helpful Votes Breakdown */}
      {showDetails && totalVotes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              Votos Útiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Votos útiles</span>
                <span className="font-medium">
                  {helpfulVotes} / {totalVotes}
                </span>
              </div>
              <Progress value={helpfulPercentage} className="h-2" />
              <p className="text-sm text-gray-600">
                {helpfulPercentage >= 80
                  ? "Excelente"
                  : helpfulPercentage >= 60
                    ? "Muy bueno"
                    : helpfulPercentage >= 40
                      ? "Bueno"
                      : helpfulPercentage >= 20
                        ? "Regular"
                        : "Bajo"}{" "}
                nivel de utilidad
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
