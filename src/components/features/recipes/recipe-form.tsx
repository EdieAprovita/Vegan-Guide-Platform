"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import type { Recipe } from "@/lib/api/recipes";

const recipeSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  ingredients: z
    .array(z.string())
    .min(1, "At least one ingredient is required")
    .max(50, "Maximum 50 ingredients allowed"),
  instructions: z
    .array(z.string())
    .min(1, "At least one instruction is required")
    .max(30, "Maximum 30 instructions allowed"),
  preparationTime: z
    .number()
    .min(1, "Preparation time must be at least 1 minute")
    .max(1440, "Preparation time must be less than 24 hours"),
  cookingTime: z
    .number()
    .min(0, "Cooking time must be at least 0 minutes")
    .max(1440, "Cooking time must be less than 24 hours"),
  servings: z
    .number()
    .min(1, "Servings must be at least 1")
    .max(50, "Servings must be less than 50"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  categories: z
    .array(z.string())
    .min(1, "At least one category is required")
    .max(5, "Maximum 5 categories allowed"),
  image: z.instanceof(File).optional(),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  isLoading?: boolean;
}

export function RecipeForm({
  initialData,
  onSubmit,
  isLoading = false,
}: RecipeFormProps) {
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      ingredients: initialData?.ingredients || [""],
      instructions: initialData?.instructions || [""],
      preparationTime: initialData?.preparationTime || 0,
      cookingTime: initialData?.cookingTime || 0,
      servings: initialData?.servings || 1,
      difficulty: initialData?.difficulty || "medium",
      categories: initialData?.categories || [],
    },
  });

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission failed:", error);
    }
  };

  const addIngredient = () => {
    const currentIngredients = form.getValues("ingredients");
    form.setValue("ingredients", [...currentIngredients, ""]);
  };

  const removeIngredient = (index: number) => {
    const currentIngredients = form.getValues("ingredients");
    form.setValue(
      "ingredients",
      currentIngredients.filter((_, i) => i !== index)
    );
  };

  const addInstruction = () => {
    const currentInstructions = form.getValues("instructions");
    form.setValue("instructions", [...currentInstructions, ""]);
  };

  const removeInstruction = (index: number) => {
    const currentInstructions = form.getValues("instructions");
    form.setValue(
      "instructions",
      currentInstructions.filter((_, i) => i !== index)
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter recipe title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter recipe description"
                  className="h-24"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Ingredients</FormLabel>
          {form.getValues("ingredients").map((_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`ingredients.${index}`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} placeholder="Enter ingredient" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      className="shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addIngredient}
            className="w-full">
            Add Ingredient
          </Button>
        </div>

        <div className="space-y-4">
          <FormLabel>Instructions</FormLabel>
          {form.getValues("instructions").map((_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`instructions.${index}`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter instruction step"
                        className="h-20"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      className="shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addInstruction}
            className="w-full">
            Add Instruction
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="preparationTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preparation Time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cookingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cooking Time (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categories"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange([...field.value, value])
                  }>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Add category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-sm">
                      <span className="capitalize">{category}</span>
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(
                            field.value.filter((_, i) => i !== index)
                          )
                        }
                        className="hover:text-emerald-900">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Recipe Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange(file);
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-['Playfair_Display'] font-bold h-12 rounded-3xl shadow-[0px_8px_16px_0px_rgba(34,197,94,0.25)] border-0 transition-all duration-300">
          {isLoading
            ? initialData
              ? "Updating Recipe..."
              : "Creating Recipe..."
            : initialData
            ? "Update Recipe"
            : "Create Recipe"}
        </Button>
      </form>
    </Form>
  );
} 