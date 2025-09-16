"use client";

import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";

export function Hero() {
  return (
    <div className="relative flex min-h-screen w-full flex-col justify-center">
      {/* Background Image */}
      <SafeImage
        src="https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg"
        alt="Fresh green vegetables"
        className="absolute top-0 left-0 z-10 h-full w-full object-cover"
        fill
        priority
      />

      {/* Overlay */}
      <div className="absolute top-0 left-0 z-20 h-full w-full bg-gradient-to-r from-black/90 via-black/60 to-black/30 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-transparent" />

      {/* Content */}
      <div className="relative z-30 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-full sm:max-w-[620px]">
          <div className="mb-4 text-center font-['Playfair_Display'] text-base font-normal text-white sm:mb-7 sm:text-left sm:text-lg md:text-[22px]">
            Tu compañero definitivo para el estilo de vida vegano
          </div>

          <div className="mb-6 text-center font-['Clicker_Script'] text-[60px] leading-[0.8] font-normal text-white sm:mb-8 sm:text-left sm:text-6xl sm:leading-tight md:text-8xl lg:text-[150px] lg:leading-[1.1]">
            Verde Guide
          </div>

          <div className="mb-6 max-w-full text-center font-['Playfair_Display'] text-sm leading-relaxed font-normal text-white sm:mb-8 sm:max-w-[527px] sm:text-left sm:text-base md:mb-12 md:text-xl md:leading-[34px]">
            Descubre restaurantes veganos, recetas nutritivas, doctores especializados, mercados
            orgánicos y únete a una comunidad comprometida con la salud y la sostenibilidad. Todo lo
            que necesitas para tu viaje vegano en un solo lugar.
          </div>

          {/* Feature highlights */}
          <div className="mb-8 sm:mb-12 md:mb-[68px]">
            <div className="grid grid-cols-2 gap-4 text-xs text-white sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span>🍽️ Restaurantes Veganos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span>👨‍⚕️ Doctores Especializados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span>🥗 Recetas Nutritivas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span>🛒 Mercados Orgánicos</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:justify-start">
            <Button className="h-12 w-[140px] touch-manipulation rounded-3xl border-0 bg-green-500 font-['Playfair_Display'] text-sm font-bold text-white shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] hover:bg-green-600 sm:h-12 sm:w-[134px] sm:text-base">
              Explorar Ahora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
