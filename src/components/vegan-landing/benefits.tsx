"use client";

import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: "https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg",
    title: "Nutrient Dense",
    description: "Foods packed with essential vitamins",
  },
  {
    icon: "https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg",
    title: "Sustainable",
    description: "Eco-friendly choices for our planet",
  },
  {
    icon: "https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg",
    title: "Delicious",
    description: "Flavors like you've never experienced",
  },
  {
    icon: "https://images.pexels.com/photos/6853406/pexels-photo-6853406.jpeg",
    title: "Affordable",
    description: "Plant-based eating on any budget",
  },
];

export function Benefits() {
  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-[82px] px-4 sm:px-6 lg:px-24 xl:px-[93px] text-center">
      <div className="text-green-800 font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-[54px] font-bold mb-4 leading-tight">
        Why choose plant-based?
      </div>

      <div className="text-gray-600 font-['Playfair_Display'] text-sm sm:text-base md:text-xl font-normal leading-relaxed md:leading-[34px] mb-8 sm:mb-12 lg:mb-[66px] max-w-3xl mx-auto">
        We don't just provide recipes, we transform lives through plants!
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12 sm:mb-20 lg:mb-[154px] max-w-6xl mx-auto">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="w-full max-w-[280px] mx-auto h-auto min-h-[260px] sm:h-[284px] border border-green-200/60 p-6 sm:p-9 text-center bg-green-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              src={benefit.icon}
              alt={benefit.title}
              className="w-[70px] sm:w-[88px] h-[70px] sm:h-[88px] mx-auto mb-4 sm:mb-6 rounded-full object-cover"
            />

            <div className="text-green-800 font-['Playfair_Display'] text-xl sm:text-[28px] font-bold mb-2 leading-tight">
              {benefit.title}
            </div>

            <div className="text-gray-600 font-['Playfair_Display'] text-base sm:text-xl font-normal leading-relaxed sm:leading-[27px]">
              {benefit.description}
            </div>
          </div>
        ))}
      </div>

      <div className="text-gray-600 font-['Playfair_Display'] text-base sm:text-xl font-normal mb-6 max-w-2xl mx-auto">
        <span>
          Great transformations start with great nutrition. Let's help you
          achieve that.
        </span>
        <br className="hidden sm:block" />
        <span className="sm:ml-0 ml-1">Get started today.</span>
      </div>

      <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm sm:text-base font-bold w-[140px] sm:w-[134px] h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0 touch-manipulation">
        Join Us
      </Button>
    </div>
  );
}
