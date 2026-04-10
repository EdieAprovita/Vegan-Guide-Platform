"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { newRestaurantFormSchema, type NewRestaurantFormData } from "@/lib/validations/restaurants";
import type { BackendResponse } from "@/lib/api/config";
import type { Restaurant } from "@/lib/api/restaurants";

export function RestaurantFormClient() {
  const router = useRouter();
  const [cuisineInput, setCuisineInput] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NewRestaurantFormData>({
    resolver: zodResolver(newRestaurantFormSchema),
    defaultValues: {
      restaurantName: "",
      address: "",
      cuisine: [],
      image: "",
    },
  });

  const cuisines = watch("cuisine");

  const addCuisine = () => {
    const trimmed = cuisineInput.trim();
    if (!trimmed) return;
    if (!cuisines.includes(trimmed)) {
      setValue("cuisine", [...cuisines, trimmed], { shouldValidate: true });
    }
    setCuisineInput("");
  };

  const removeCuisine = (tag: string) => {
    setValue(
      "cuisine",
      cuisines.filter((c) => c !== tag),
      { shouldValidate: true }
    );
  };

  const handleCuisineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCuisine();
    }
  };

  const onSubmit = async (data: NewRestaurantFormData) => {
    try {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          (errorData as { message?: string }).message || "Failed to create restaurant";
        throw new Error(message);
      }

      const result: BackendResponse<Restaurant> = await response.json();
      toast.success("Restaurant created successfully!");
      router.push(`/restaurants/${result.data._id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create restaurant");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6" noValidate>
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Restaurant Name */}
          <div className="space-y-2">
            <Label htmlFor="restaurantName">
              Restaurant Name{" "}
              <span aria-label="required" className="text-red-600">
                *
              </span>
            </Label>
            <Input
              id="restaurantName"
              type="text"
              placeholder="e.g. Green Garden Bistro"
              aria-required="true"
              aria-invalid={!!errors.restaurantName}
              aria-describedby={errors.restaurantName ? "restaurantName-error" : undefined}
              className={errors.restaurantName ? "border-red-500" : ""}
              {...register("restaurantName")}
            />
            {errors.restaurantName && (
              <p id="restaurantName-error" role="alert" className="text-sm text-red-600">
                {errors.restaurantName.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Address{" "}
              <span aria-label="required" className="text-red-600">
                *
              </span>
            </Label>
            <Input
              id="address"
              type="text"
              placeholder="e.g. 123 Plant Street, San Francisco, CA"
              aria-required="true"
              aria-invalid={!!errors.address}
              aria-describedby={errors.address ? "address-error" : undefined}
              className={errors.address ? "border-red-500" : ""}
              {...register("address")}
            />
            {errors.address && (
              <p id="address-error" role="alert" className="text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">
              Budget{" "}
              <span aria-label="required" className="text-red-600">
                *
              </span>
            </Label>
            <Controller
              control={control}
              name="budget"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="budget"
                    aria-required="true"
                    aria-invalid={!!errors.budget}
                    aria-describedby={errors.budget ? "budget-error" : undefined}
                    className={errors.budget ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low — budget-friendly</SelectItem>
                    <SelectItem value="medium">Medium — mid-range</SelectItem>
                    <SelectItem value="high">High — fine dining</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.budget && (
              <p id="budget-error" role="alert" className="text-sm text-red-600">
                {errors.budget.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cuisine Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Cuisine Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cuisineInput">
              Cuisine{" "}
              <span aria-label="required" className="text-red-600">
                *
              </span>
            </Label>
            <p id="cuisine-hint" className="text-sm text-gray-500">
              Type a cuisine and press Enter or comma to add it
            </p>
            <div className="flex gap-2">
              <Input
                id="cuisineInput"
                type="text"
                placeholder="e.g. Italian, Asian, Mediterranean"
                value={cuisineInput}
                onChange={(e) => setCuisineInput(e.target.value)}
                onKeyDown={handleCuisineKeyDown}
                aria-describedby="cuisine-hint"
                aria-invalid={!!errors.cuisine}
                className={errors.cuisine ? "border-red-500" : ""}
              />
              <Button type="button" variant="outline" onClick={addCuisine}>
                Add
              </Button>
            </div>
            {cuisines.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2" role="list" aria-label="Selected cuisines">
                {cuisines.map((tag) => (
                  <span
                    key={tag}
                    role="listitem"
                    className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeCuisine(tag)}
                      aria-label={`Remove ${tag}`}
                      className="ml-1 rounded-full hover:text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <X className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {errors.cuisine && (
              <p id="cuisine-error" role="alert" className="text-sm text-red-600">
                {errors.cuisine.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card>
        <CardHeader>
          <CardTitle>Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              type="url"
              placeholder="https://example.com/photo.jpg"
              aria-invalid={!!errors.image}
              aria-describedby={errors.image ? "image-error" : undefined}
              className={errors.image ? "border-red-500" : ""}
              {...register("image")}
            />
            {errors.image && (
              <p id="image-error" role="alert" className="text-sm text-red-600">
                {errors.image.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-32 bg-emerald-600 hover:bg-emerald-700"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span
                role="status"
                aria-label="Creating restaurant..."
                className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              >
                <span className="sr-only">Creating...</span>
              </span>
              Creating...
            </span>
          ) : (
            "Add Restaurant"
          )}
        </Button>
      </div>
    </form>
  );
}
