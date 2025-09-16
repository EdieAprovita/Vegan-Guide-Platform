"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Clock, Users, ChefHat, Star } from "lucide-react";

interface RecipeCardProps {
  title: string;
  description: string;
  image: string;
  preparationTime: number;
  cookingTime: number;
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  averageRating: number;
  author: {
    username: string;
    photo?: string;
  };
  onView: () => void;
}

export function RecipeCard({
  title,
  description,
  image,
  preparationTime,
  cookingTime,
  servings,
  difficulty,
  averageRating,
  author,
  onView,
}: RecipeCardProps) {
  const totalTime = preparationTime + cookingTime;
  const difficultyColor = {
    easy: "text-green-500",
    medium: "text-yellow-500",
    hard: "text-red-500",
  }[difficulty];

  return (
    <Card className="overflow-hidden bg-white/80 backdrop-blur-sm transition-all hover:shadow-lg">
      <div className="group relative h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 backdrop-blur-sm">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{averageRating.toFixed(1)}</span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h3 className="line-clamp-1 font-['Playfair_Display'] text-xl font-bold text-emerald-800">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-emerald-600/80">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-emerald-700">
            <Clock className="h-4 w-4" />
            <span>{totalTime} min</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700">
            <Users className="h-4 w-4" />
            <span>{servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className={`h-4 w-4 ${difficultyColor}`} />
            <span className={`capitalize ${difficultyColor}`}>{difficulty}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-emerald-100 pt-2">
          {author.photo ? (
            <Image
              src={author.photo}
              alt={author.username}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-xs font-medium text-emerald-700">{author.username[0]}</span>
            </div>
          )}
          <span className="text-sm text-emerald-600">{author.username}</span>
        </div>

        <Button
          onClick={onView}
          className="w-full bg-gradient-to-br from-green-500 to-emerald-600 font-['Playfair_Display'] font-medium text-white shadow-[0px_4px_12px_0px_rgba(34,197,94,0.25)] transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
        >
          View Recipe
        </Button>
      </div>
    </Card>
  );
}
