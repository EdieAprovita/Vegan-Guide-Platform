"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

const recipes = [
  {
    image: "https://images.pexels.com/photos/17559227/pexels-photo-17559227.jpeg",
    title: "Buddha Bowl",
    description: "Quinoa 40% | Vegetables 60%",
    time: "25 min",
  },
  {
    image: "https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg",
    title: "Green Smoothie",
    description: "Spinach 30% | Fruits 70%",
    time: "5 min",
  },
  {
    image: "https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg",
    title: "Lentil Curry",
    description: "Protein 35% | Spices 65%",
    time: "45 min",
  },
  {
    image: "https://images.pexels.com/photos/6853406/pexels-photo-6853406.jpeg",
    title: "Avocado Toast",
    description: "Healthy Fats | Fiber Rich",
    time: "10 min",
  },
];

export function RecipeShowcase() {
  return (
    <div className="relative px-4 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-24 lg:py-[82px] xl:px-[93px]">
      {/* Decorative background element */}
      <Image
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt=""
        className="absolute top-[508px] right-[-127px] z-10 hidden h-[261px] w-[478px] object-cover opacity-20 xl:block"
        width={478}
        height={261}
      />

      <div className="mx-auto mb-4 max-w-[795px] text-center font-['Playfair_Display'] text-2xl leading-tight font-bold text-green-800 sm:text-3xl md:text-4xl lg:text-[54px]">
        Enjoy delicious plant-based recipes
      </div>

      <div className="mx-auto mb-8 max-w-[980px] text-center font-['Playfair_Display'] text-sm leading-relaxed font-normal text-gray-600 sm:mb-12 sm:text-base md:text-xl md:leading-[34px] lg:mb-[66px]">
        Explore incredible flavors with our plant-based recipes. There&apos;s always a new dish
        worth discovering
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {recipes.map((recipe, index) => (
          <div
            key={index}
            className="relative w-full max-w-[280px] overflow-hidden rounded-lg border border-green-200/60 bg-green-50 shadow-sm transition-shadow hover:shadow-md"
          >
            <Image
              src={recipe.image}
              alt={recipe.title}
              className="h-[200px] w-full object-cover sm:h-[222px]"
              width={280}
              height={200}
            />

            <div className="p-4 pb-20 text-center">
              <div className="mb-2 font-['Playfair_Display'] text-lg font-bold text-green-800 sm:text-[22px]">
                {recipe.title}
              </div>

              <div className="mb-2 font-['Playfair_Display'] text-sm font-normal text-gray-800 sm:text-base">
                {recipe.description}
              </div>

              <div className="font-['Playfair_Display'] text-base font-bold text-green-800 sm:text-lg">
                {recipe.time}
              </div>
            </div>

            <Button className="absolute bottom-4 left-1/2 h-12 w-[120px] -translate-x-1/2 transform touch-manipulation rounded-3xl border-0 bg-green-500 font-['Playfair_Display'] text-sm font-bold text-white shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] hover:bg-green-600 sm:w-[134px] sm:text-base">
              Try Recipe
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
