"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Clock, Users, ChefHat, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
    easy: "text-secondary-foreground", // usa tokens; opcional: crear token específico
    medium: "text-muted-foreground",
    hard: "text-destructive",
  }[difficulty];

  return (
    <Card className="bg-card overflow-hidden transition-all hover:shadow-lg">
      <div className="group relative h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
        <div className="bg-popover/90 absolute top-2 right-2 flex items-center gap-1 rounded-full px-2 py-1 backdrop-blur-sm">
          <Star className="fill-primary text-primary h-4 w-4" />
          <span className="text-popover-foreground text-sm font-medium">
            {averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h3 className="font-brand-serif text-foreground line-clamp-1 text-xl font-bold">
            {title}
          </h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{description}</p>
        </div>

        <div className="text-foreground grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{totalTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{servings} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className={cn("h-4 w-4", difficultyColor)} />
            <span className={cn("capitalize", difficultyColor)}>{difficulty}</span>
          </div>
        </div>

        <div className="border-border flex items-center gap-2 border-t pt-2">
          {author.photo ? (
            <Image
              src={author.photo}
              alt={author.username}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="bg-accent flex h-6 w-6 items-center justify-center rounded-full">
              <span className="text-accent-foreground text-xs font-medium">
                {author.username[0]}
              </span>
            </div>
          )}
          <span className="text-muted-foreground text-sm">{author.username}</span>
        </div>

        <Button onClick={onView} className="w-full">
          View Recipe
        </Button>
      </div>
    </Card>
  );
}
