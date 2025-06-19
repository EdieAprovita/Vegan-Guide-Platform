"use client";

import { Button } from "@/components/ui/button";

export function About() {
  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-[82px] px-4 sm:px-6 lg:px-24 xl:px-[93px] flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-[95px] relative">
      {/* Decorative background element */}
      <img
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt=""
        className="absolute left-[-121px] top-[339px] z-10 w-[498px] h-[272px] object-cover opacity-20 hidden xl:block"
      />

      <div className="flex-1 max-w-full lg:max-w-[585px] relative z-20 text-center lg:text-left">
        <div className="text-green-800 font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-[54px] font-bold mb-4 sm:mb-6 lg:mb-[33px] leading-tight">
          Discover plant-based living
        </div>

        <div className="text-gray-600 font-['Playfair_Display'] text-sm sm:text-base md:text-xl font-normal leading-relaxed md:leading-[34px] mb-8 sm:mb-12 lg:mb-[68px]">
          Verde Guide is your comprehensive resource for embracing a plant-based
          lifestyle that nourishes your body and protects our planet. From
          delicious recipes to sustainable living tips, we provide everything
          you need to thrive on plants. Experience the incredible benefits of
          plant-based nutrition and join a community committed to health,
          compassion, and environmental stewardship.
        </div>

        <div className="flex justify-center lg:justify-start">
          <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm sm:text-base font-bold w-[140px] sm:w-[134px] h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0 touch-manipulation">
            Learn More
          </Button>
        </div>
      </div>

      <div className="w-full max-w-[400px] sm:max-w-[500px] lg:w-[500px] h-[280px] sm:h-[350px] lg:h-[484px] relative overflow-hidden bg-green-100 rounded-lg shadow-lg">
        <img
          src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
          alt="Colorful plant-based meal prep containers"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
