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
import { X } from "lucide-react";
import type { Recipe } from "@/lib/api/recipes";

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
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
  image: z.any().optional(), // Use z.any() instead of z.instanceof(File) for SSR compatibility
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
  isLoading?: boolean;
}

export function RecipeForm({ initialData, onSubmit, isLoading = false }: RecipeFormProps) {
  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      ingredients: initialData?.ingredients || [""],
      instructions: Array.isArray(initialData?.instructions)
        ? initialData.instructions
        : initialData?.instructions
          ? [initialData.instructions]
          : [""],
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" noValidate>
        <FormField
          control={form.control}
          name="title"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>
                Title{" "}
                <span aria-label="required" className="text-rose-500">
                  *
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  id="recipe-title"
                  {...field}
                  placeholder="Enter recipe title"
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? "recipe-title-error" : undefined}
                />
              </FormControl>
              <FormMessage id="recipe-title-error" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel>
                Description{" "}
                <span aria-label="required" className="text-rose-500">
                  *
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  id="recipe-description"
                  {...field}
                  placeholder="Enter recipe description"
                  className="h-24"
                  aria-required="true"
                  aria-invalid={!!error}
                  aria-describedby={error ? "recipe-description-error" : undefined}
                />
              </FormControl>
              <FormMessage id="recipe-description-error" />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>
            Ingredients{" "}
            <span aria-label="required" className="text-rose-500">
              *
            </span>
          </FormLabel>
          {form.getValues("ingredients").map((_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`ingredients.${index}`}
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter ingredient"
                        aria-label={`Ingredient ${index + 1}`}
                        aria-invalid={!!error}
                        aria-describedby={error ? `recipe-ingredient-${index}-error` : undefined}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      className="shrink-0"
                      aria-label={`Remove ingredient ${index + 1}`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <FormMessage id={`recipe-ingredient-${index}-error`} />
                </FormItem>
              )}
            />
          ))}
          <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
            Add Ingredient
          </Button>
        </div>

        <div className="space-y-4">
          <FormLabel>
            Instructions{" "}
            <span aria-label="required" className="text-rose-500">
              *
            </span>
          </FormLabel>
          {form.getValues("instructions").map((_, index) => (
            <FormField
              key={index}
              control={form.control}
              name={`instructions.${index}`}
              render={({ field, fieldState: { error } }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter instruction step"
                        className="h-20"
                        aria-label={`Instruction step ${index + 1}`}
                        aria-invalid={!!error}
                        aria-describedby={error ? `recipe-instruction-${index}-error` : undefined}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeInstruction(index)}
                      className="shrink-0"
                      aria-label={`Remove instruction step ${index + 1}`}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                  <FormMessage id={`recipe-instruction-${index}-error`} />
                </FormItem>
              )}
            />
          ))}
          <Button type="button" variant="outline" onClick={addInstruction} className="w-full">
            Add Instruction
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="preparationTime"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>
                  Preparation Time (minutes){" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="recipe-prep-time"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "recipe-prep-time-error" : undefined}
                  />
                </FormControl>
                <FormMessage id="recipe-prep-time-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cookingTime"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>
                  Cooking Time (minutes){" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="recipe-cook-time"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "recipe-cook-time-error" : undefined}
                  />
                </FormControl>
                <FormMessage id="recipe-cook-time-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="servings"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel>
                  Servings{" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    id="recipe-servings"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "recipe-servings-error" : undefined}
                  />
                </FormControl>
                <FormMessage id="recipe-servings-error" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel htmlFor="recipe-difficulty">
                  Difficulty{" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <select
                    id="recipe-difficulty"
                    value={field.value}
                    onChange={field.onChange}
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "recipe-difficulty-error" : undefined}
                    className="border-input focus:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="">Select difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </FormControl>
                <FormMessage id="recipe-difficulty-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categories"
            render={({ field, fieldState: { error } }) => (
              <FormItem>
                <FormLabel htmlFor="recipe-categories">
                  Categories{" "}
                  <span aria-label="required" className="text-rose-500">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <select
                    id="recipe-categories"
                    onChange={(e) => {
                      if (e.target.value && !field.value.includes(e.target.value)) {
                        field.onChange([...field.value, e.target.value]);
                      }
                      e.target.value = ""; // Reset select
                    }}
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? "recipe-categories-error" : undefined}
                    className="border-input focus:ring-ring w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-1 focus:outline-none"
                  >
                    <option value="">Add category</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="dessert">Dessert</option>
                    <option value="snack">Snack</option>
                  </select>
                </FormControl>
                <div className="mt-2 flex flex-wrap gap-2" aria-label="Selected categories">
                  {field.value.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-sm text-emerald-700"
                    >
                      <span className="capitalize">{category}</span>
                      <button
                        type="button"
                        onClick={() => field.onChange(field.value.filter((_, i) => i !== index))}
                        className="hover:text-emerald-900"
                        aria-label={`Remove category ${category}`}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
                <FormMessage id="recipe-categories-error" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field, fieldState: { error } }) => (
            <FormItem>
              <FormLabel htmlFor="recipe-image">Recipe Image</FormLabel>
              <FormControl>
                <Input
                  id="recipe-image"
                  type="file"
                  accept="image/*"
                  aria-invalid={!!error}
                  aria-describedby={error ? "recipe-image-error" : undefined}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) field.onChange(file);
                  }}
                />
              </FormControl>
              <FormMessage id="recipe-image-error" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 w-full rounded-3xl border-0 bg-gradient-to-br from-green-500 to-emerald-600 font-['Playfair_Display'] font-bold text-white shadow-[0px_8px_16px_0px_rgba(34,197,94,0.25)] transition-all duration-300 hover:from-green-600 hover:to-emerald-700"
        >
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
