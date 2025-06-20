"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Hero() {
  return (
    <div className="w-full min-h-screen relative flex flex-col justify-center">
      {/* Background Image */}
      <Image
        src="https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg"
        alt="Fresh green vegetables"
        className="w-full h-full object-cover absolute top-0 left-0 z-10"
        fill
        priority
      />

      {/* Overlay */}
      <div className="w-full h-full bg-gradient-to-r from-black/90 via-black/60 to-black/30 sm:bg-gradient-to-r sm:from-black/80 sm:via-black/40 sm:to-transparent absolute top-0 left-0 z-20" />

      {/* Content */}
      <div className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="max-w-full sm:max-w-[620px]">
          <div className="text-white font-['Playfair_Display'] text-base sm:text-lg md:text-[22px] font-normal mb-4 sm:mb-7 text-center sm:text-left">
            Tu compañero definitivo para el estilo de vida vegano
          </div>

          <div className="text-white font-['Clicker_Script'] text-[60px] sm:text-6xl md:text-8xl lg:text-[150px] font-normal leading-[0.8] sm:leading-tight lg:leading-[1.1] mb-6 sm:mb-8 text-center sm:text-left">
            Verde Guide
          </div>

          <div className="text-white font-['Playfair_Display'] text-sm sm:text-base md:text-xl font-normal leading-relaxed md:leading-[34px] mb-6 sm:mb-8 md:mb-12 max-w-full sm:max-w-[527px] text-center sm:text-left">
            Descubre restaurantes veganos, recetas nutritivas, doctores especializados, mercados orgánicos y únete a una comunidad comprometida con la salud y la sostenibilidad. Todo lo que necesitas para tu viaje vegano en un solo lugar.
          </div>

          {/* Feature highlights */}
          <div className="mb-8 sm:mb-12 md:mb-[68px]">
            <div className="grid grid-cols-2 gap-4 text-white text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>🍽️ Restaurantes Veganos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>👨‍⚕️ Doctores Especializados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>🥗 Recetas Nutritivas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>🛒 Mercados Orgánicos</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center sm:justify-start">
            <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm sm:text-base font-bold w-[140px] sm:w-[134px] h-12 sm:h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0 touch-manipulation">
              Explorar Ahora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
