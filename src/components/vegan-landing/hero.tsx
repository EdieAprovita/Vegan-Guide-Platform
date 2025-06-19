"use client";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="w-full h-[100vh] min-h-[600px] max-h-[800px] sm:h-[768px] relative flex flex-col">
      {/* Background Image */}
      <img
        src="https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg"
        alt="Fresh green vegetables"
        className="w-full h-full object-cover absolute top-0 left-0 z-10"
      />

      {/* Overlay */}
      <div className="w-full h-full bg-gradient-to-r from-black/90 via-black/60 to-black/30 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-transparent absolute top-0 left-0 z-20" />

      {/* Content */}
      <div className="relative z-30 pt-24 sm:pt-32 md:pt-40 lg:pt-[162px] px-4 sm:px-6 lg:px-24 xl:px-[93px] max-w-full sm:max-w-[620px] flex-1 flex flex-col justify-center sm:justify-start">
        <div className="text-white font-['Playfair_Display'] text-base sm:text-lg md:text-[22px] font-normal mb-4 sm:mb-7 text-center sm:text-left">
          Transform your life with the power of
        </div>

        <div className="text-white font-['Clicker_Script'] text-[60px] sm:text-6xl md:text-8xl lg:text-[220px] font-normal leading-[0.8] sm:leading-tight lg:leading-[291px] mb-6 sm:mb-8 text-center sm:text-left">
          Plants
        </div>

        <div className="text-white font-['Playfair_Display'] text-sm sm:text-base md:text-xl font-normal leading-relaxed md:leading-[34px] mb-8 sm:mb-12 md:mb-[68px] max-w-full sm:max-w-[527px] text-center sm:text-left">
          Discover the incredible world of plant-based living. From nutritious
          recipes to sustainable practices, we provide everything you need for a
          healthier lifestyle. Join our community and embrace the plant-powered
          life.
        </div>

        <div className="flex justify-center sm:justify-start">
          <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm sm:text-base font-bold w-[140px] sm:w-[134px] h-12 sm:h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0 touch-manipulation">
            Start Now
          </Button>
        </div>
      </div>
    </div>
  );
}
