"use client";

import Image from "next/image";

export function Testimonials() {
  return (
    <div className="relative px-4 py-12 text-center sm:px-6 sm:py-16 md:py-20 lg:px-24 lg:py-[82px] xl:px-[93px]">
      {/* Decorative background elements */}
      <Image
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt=""
        className="absolute top-12 left-[-26px] z-10 hidden h-[272px] w-[498px] object-cover opacity-20 xl:block"
        width={498}
        height={272}
      />
      <Image
        src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
        alt=""
        className="absolute top-[521px] right-0 z-10 hidden h-[226px] w-[414px] object-cover opacity-20 xl:block"
        width={414}
        height={226}
      />

      <div className="mx-auto mb-4 max-w-[764px] font-['Playfair_Display'] text-2xl leading-tight font-bold text-green-800 sm:text-3xl md:text-4xl lg:text-[54px]">
        Our plant-based transformation stories
      </div>

      <div className="mx-auto mb-8 max-w-2xl font-['Playfair_Display'] text-sm leading-relaxed font-normal text-gray-600 sm:mb-10 sm:text-base md:text-xl md:leading-[34px] lg:mb-[45px]">
        Our community has incredible stories to share about their plant-based journey
      </div>

      <div className="relative mx-auto h-auto min-h-[400px] w-full max-w-[980px] rounded-lg border border-green-200/60 bg-green-50 p-6 shadow-sm sm:min-h-[524px] sm:p-8 lg:p-[75px_100px]">
        <div className="absolute top-4 left-2 font-['Playfair_Display'] text-[80px] leading-[60px] font-bold text-green-800 sm:top-8 sm:left-4 sm:text-[120px] sm:leading-[112px] md:text-[180px] lg:top-[54px] lg:left-[29px] lg:text-[220px]">
          &quot;
        </div>

        <div className="relative z-10 mx-auto mb-8 max-w-[780px] pt-12 text-center font-['Playfair_Display'] text-sm leading-relaxed font-bold text-gray-600 sm:mb-16 sm:pt-16 sm:text-base md:text-lg md:leading-9 lg:mb-[88px]">
          Switching to a plant-based lifestyle has been the most transformative decision of my life.
          Not only do I feel more energetic and healthier, but I also feel good knowing that my
          choices are making a positive impact on the environment. The Verde Guide community has
          been incredibly supportive throughout my journey, providing delicious recipes and
          practical tips that made the transition seamless and enjoyable.
        </div>

        <div className="mb-1 font-['Playfair_Display'] text-lg font-bold text-green-800 sm:mb-2 sm:text-2xl md:text-[32px]">
          Sarah Martinez
        </div>

        <div className="mb-6 font-['Playfair_Display'] text-base leading-relaxed font-normal text-gray-600 sm:mb-10 sm:text-xl sm:leading-[34px] lg:mb-[45px]">
          Wellness Coach
        </div>

        <Image
          src="https://images.pexels.com/photos/6853406/pexels-photo-6853406.jpeg"
          alt="Sarah Martinez"
          className="mx-auto h-[80px] w-[80px] rounded-2xl object-cover shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] sm:h-[112px] sm:w-[112px]"
          width={112}
          height={112}
        />
      </div>

      {/* Navigation arrows - hidden on mobile for simplicity */}
      <div className="absolute top-1/2 left-8 flex hidden h-12 w-12 -translate-y-1/2 transform cursor-pointer touch-manipulation items-center justify-center rounded-xl bg-green-500 shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] sm:left-16 sm:h-16 sm:w-16 md:flex lg:left-32 lg:h-20 lg:w-20 lg:rounded-2xl xl:left-44">
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          className="text-green-800 sm:h-4 sm:w-4"
        >
          <path
            d="M10 2L6 6L10 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="absolute top-1/2 right-8 flex hidden h-12 w-12 -translate-y-1/2 transform cursor-pointer touch-manipulation items-center justify-center rounded-xl bg-green-500 shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] sm:right-16 sm:h-16 sm:w-16 md:flex lg:right-32 lg:h-20 lg:w-20 lg:rounded-2xl xl:right-44">
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          className="text-green-800 sm:h-4 sm:w-4"
        >
          <path
            d="M6 2L10 6L6 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
