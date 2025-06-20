"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

const recipes = [
  {
    image:
      "https://images.pexels.com/photos/17559227/pexels-photo-17559227.jpeg",
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
    <div className="py-12 sm:py-16 md:py-20 lg:py-[82px] px-4 sm:px-6 lg:px-24 xl:px-[93px] relative">
      {/* Decorative background element */}
      <Image
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt=""
        className="absolute right-[-127px] top-[508px] z-10 w-[478px] h-[261px] object-cover opacity-20 hidden xl:block"
        width={478}
        height={261}
      />

      <div className="text-green-800 font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-[54px] font-bold text-center mb-4 max-w-[795px] mx-auto leading-tight">
        Enjoy delicious plant-based recipes
      </div>

      <div className="text-gray-600 font-['Playfair_Display'] text-sm sm:text-base md:text-xl font-normal leading-relaxed md:leading-[34px] text-center mb-8 sm:mb-12 lg:mb-[66px] max-w-[980px] mx-auto">
        Explore incredible flavors with our plant-based recipes. There&apos;s always
        a new dish worth discovering
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 justify-items-center max-w-7xl mx-auto">
        {recipes.map((recipe, index) => (
          <div
            key={index}
            className="w-full max-w-[280px] border border-green-200/60 relative bg-green-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <Image
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-[200px] sm:h-[222px] object-cover"
              width={280}
              height={200}
            />

            <div className="p-4 pb-20 text-center">
              <div className="text-green-800 font-['Playfair_Display'] text-lg sm:text-[22px] font-bold mb-2">
                {recipe.title}
              </div>

              <div className="text-gray-800 font-['Playfair_Display'] text-sm sm:text-base font-normal mb-2">
                {recipe.description}
              </div>

              <div className="text-green-800 font-['Playfair_Display'] text-base sm:text-lg font-bold">
                {recipe.time}
              </div>
            </div>

            <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm sm:text-base font-bold w-[120px] sm:w-[134px] h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0 absolute bottom-4 left-1/2 transform -translate-x-1/2 touch-manipulation">
              Try Recipe
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
