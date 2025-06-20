"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Newsletter() {
  return (
    <div className="w-full h-[500px] sm:h-[600px] lg:h-[698px] relative flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg"
        alt="Green vegetables background"
        className="w-full h-full object-cover absolute top-0 left-0 z-10"
        fill
        priority
      />

      {/* Footer background overlay */}
      <div className="w-full h-[350px] sm:h-[400px] lg:h-[492px] absolute bottom-0 left-0 z-20 bg-green-900" />

      {/* Decorative side images - hidden on mobile for better performance */}
      <Image
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt=""
        className="absolute left-[-147px] bottom-[236px] z-30 w-[444px] h-[358px] object-cover opacity-60 hidden xl:block"
        width={444}
        height={358}
      />
      <Image
        src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
        alt=""
        className="absolute right-[-147px] bottom-[236px] z-30 w-[444px] h-[358px] object-cover opacity-60 hidden xl:block"
        width={444}
        height={358}
      />

      {/* Content */}
      <div className="relative z-40 text-center max-w-[980px] px-4 sm:px-6">
        <div className="text-white font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-[54px] font-bold mb-4 leading-tight">
          Subscribe to get the latest plant-based tips
        </div>

        <div className="text-white font-['Playfair_Display'] text-sm sm:text-base md:text-xl font-normal leading-relaxed md:leading-[34px] mb-6 lg:mb-[26px] max-w-2xl mx-auto">
          Don&apos;t miss out on our latest recipes, nutrition tips, and sustainable
          living advice
        </div>

        <div className="w-full max-w-[642px] h-auto relative mx-auto border border-green-200/60 rounded-lg bg-green-50 flex flex-col sm:flex-row overflow-hidden shadow-lg">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-transparent text-gray-600 font-['Playfair_Display'] text-base sm:text-lg md:text-xl font-normal px-4 sm:px-6 py-4 outline-none placeholder-gray-400 border-none"
          />
          <Button className="bg-green-500 hover:bg-green-600 text-green-800 font-['Playfair_Display'] text-lg sm:text-xl lg:text-[22px] font-bold w-full sm:w-auto sm:min-w-[137px] h-12 sm:h-auto py-4 sm:py-0 shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] rounded-none sm:rounded-r-lg border-0 m-0 touch-manipulation">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}
