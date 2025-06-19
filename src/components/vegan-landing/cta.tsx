"use client";

import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <div className="w-full h-[400px] sm:h-[500px] lg:h-[574px] relative flex items-center">
      {/* Background Image */}
      <img
        src="https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg"
        alt="Fresh vegetables background"
        className="w-full h-full object-cover absolute top-0 left-0 z-10"
      />

      {/* Overlay */}
      <div className="w-full h-full absolute top-0 left-0 z-20 bg-green-800/80" />

      {/* Content */}
      <div className="relative z-30 px-4 sm:px-6 lg:pl-24 xl:pl-[93px] lg:pr-8 max-w-full lg:max-w-[575px] text-center lg:text-left">
        <div className="text-white font-['Playfair_Display'] text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[54px] font-bold leading-tight lg:leading-[72px] mb-4 sm:mb-5 lg:mb-[22px]">
          Get a chance to have an amazing transformation
        </div>

        <div className="text-white font-['Playfair_Display'] text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed md:leading-[34px] mb-6 sm:mb-8 lg:mb-[22px]">
          We are giving you a one-time opportunity to experience a better life
          through plant-based nutrition.
        </div>

        <div className="flex justify-center lg:justify-start">
          <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm sm:text-base font-bold w-[140px] sm:w-[134px] h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0 touch-manipulation">
            Start Now
          </Button>
        </div>
      </div>

      {/* Side decorative images - hidden on mobile for better performance */}
      <img
        src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
        alt="Plant-based meal"
        className="absolute right-0 top-0 z-20 w-[657px] h-full object-cover opacity-60 hidden xl:block"
      />

      <img
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt="Healthy bowl"
        className="absolute right-[173px] top-[54px] z-30 w-[300px] h-[467px] object-cover shadow-[0px_10px_12px_0px_rgba(0,0,0,0.34)] rounded-lg hidden xl:block"
      />
    </div>
  );
}
