"use client";

export function Testimonials() {
  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-[82px] px-4 sm:px-6 lg:px-24 xl:px-[93px] relative text-center">
      {/* Decorative background elements */}
      <img
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt=""
        className="absolute left-[-26px] top-12 z-10 w-[498px] h-[272px] object-cover opacity-20 hidden xl:block"
      />
      <img
        src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
        alt=""
        className="absolute right-0 top-[521px] z-10 w-[414px] h-[226px] object-cover opacity-20 hidden xl:block"
      />

      <div className="text-green-800 font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-[54px] font-bold mb-4 max-w-[764px] mx-auto leading-tight">
        Our plant-based transformation stories
      </div>

      <div className="text-gray-600 font-['Playfair_Display'] text-sm sm:text-base md:text-xl font-normal leading-relaxed md:leading-[34px] mb-8 sm:mb-10 lg:mb-[45px] max-w-2xl mx-auto">
        Our community has incredible stories to share about their plant-based
        journey
      </div>

      <div className="w-full max-w-[980px] h-auto min-h-[400px] sm:min-h-[524px] border border-green-200/60 mx-auto relative p-6 sm:p-8 lg:p-[75px_100px] bg-green-50 rounded-lg shadow-sm">
        <div className="text-green-800 font-['Playfair_Display'] text-[80px] sm:text-[120px] md:text-[180px] lg:text-[220px] font-bold leading-[60px] sm:leading-[112px] absolute left-2 sm:left-4 lg:left-[29px] top-4 sm:top-8 lg:top-[54px]">
          "
        </div>

        <div className="text-gray-600 font-['Playfair_Display'] text-sm sm:text-base md:text-lg font-bold leading-relaxed md:leading-9 text-center mb-8 sm:mb-16 lg:mb-[88px] max-w-[780px] mx-auto relative z-10 pt-12 sm:pt-16">
          Switching to a plant-based lifestyle has been the most transformative
          decision of my life. Not only do I feel more energetic and healthier,
          but I also feel good knowing that my choices are making a positive
          impact on the environment. The Verde Guide community has been
          incredibly supportive throughout my journey, providing delicious
          recipes and practical tips that made the transition seamless and
          enjoyable.
        </div>

        <div className="text-green-800 font-['Playfair_Display'] text-lg sm:text-2xl md:text-[32px] font-bold mb-1 sm:mb-2">
          Sarah Martinez
        </div>

        <div className="text-gray-600 font-['Playfair_Display'] text-base sm:text-xl font-normal leading-relaxed sm:leading-[34px] mb-6 sm:mb-10 lg:mb-[45px]">
          Wellness Coach
        </div>

        <img
          src="https://images.pexels.com/photos/6853406/pexels-photo-6853406.jpeg"
          alt="Sarah Martinez"
          className="w-[80px] sm:w-[112px] h-[80px] sm:h-[112px] rounded-2xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] object-cover mx-auto"
        />
      </div>

      {/* Navigation arrows - hidden on mobile for simplicity */}
      <div className="absolute top-1/2 left-8 sm:left-16 lg:left-32 xl:left-44 transform -translate-y-1/2 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 bg-green-500 rounded-xl lg:rounded-2xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] cursor-pointer flex items-center justify-center hidden md:flex touch-manipulation">
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          className="text-green-800 sm:w-4 sm:h-4"
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

      <div className="absolute top-1/2 right-8 sm:right-16 lg:right-32 xl:right-44 transform -translate-y-1/2 w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 bg-green-500 rounded-xl lg:rounded-2xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] cursor-pointer flex items-center justify-center hidden md:flex touch-manipulation">
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          className="text-green-800 sm:w-4 sm:h-4"
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
