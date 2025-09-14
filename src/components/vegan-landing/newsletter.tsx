"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Newsletter() {
  return (
    <div className="relative flex h-[500px] w-full items-center justify-center sm:h-[600px] lg:h-[698px]">
      {/* Background Image */}
      <Image
        src="https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg"
        alt="Green vegetables background"
        className="absolute top-0 left-0 z-10 h-full w-full object-cover"
        fill
        priority
      />

      {/* Footer background overlay */}
      <div className="absolute bottom-0 left-0 z-20 h-[350px] w-full bg-green-900 sm:h-[400px] lg:h-[492px]" />

      {/* Decorative side images - hidden on mobile for better performance */}
      <Image
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt=""
        className="absolute bottom-[236px] left-[-147px] z-30 hidden h-[358px] w-[444px] object-cover opacity-60 xl:block"
        width={444}
        height={358}
      />
      <Image
        src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
        alt=""
        className="absolute right-[-147px] bottom-[236px] z-30 hidden h-[358px] w-[444px] object-cover opacity-60 xl:block"
        width={444}
        height={358}
      />

      {/* Content */}
      <div className="relative z-40 max-w-[980px] px-4 text-center sm:px-6">
        <div className="mb-4 font-['Playfair_Display'] text-2xl leading-tight font-bold text-white sm:text-3xl md:text-4xl lg:text-[54px]">
          Subscribe to get the latest plant-based tips
        </div>

        <div className="mx-auto mb-6 max-w-2xl font-['Playfair_Display'] text-sm leading-relaxed font-normal text-white sm:text-base md:text-xl md:leading-[34px] lg:mb-[26px]">
          Don&apos;t miss out on our latest recipes, nutrition tips, and sustainable living advice
        </div>

        <div className="relative mx-auto flex h-auto w-full max-w-[642px] flex-col overflow-hidden rounded-lg border border-green-200/60 bg-green-50 shadow-lg sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 border-none bg-transparent px-4 py-4 font-['Playfair_Display'] text-base font-normal text-gray-600 placeholder-gray-400 outline-none sm:px-6 sm:text-lg md:text-xl"
          />
          <Button className="m-0 h-12 w-full touch-manipulation rounded-none border-0 bg-green-500 py-4 font-['Playfair_Display'] text-lg font-bold text-green-800 shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] hover:bg-green-600 sm:h-auto sm:w-auto sm:min-w-[137px] sm:rounded-r-lg sm:py-0 sm:text-xl lg:text-[22px]">
            Subscribe
          </Button>
        </div>
      </div>
    </div>
  );
}
