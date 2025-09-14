"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function CallToAction() {
  return (
    <div className="relative flex h-[400px] w-full items-center sm:h-[500px] lg:h-[574px]">
      {/* Background Image */}
      <Image
        src="https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg"
        alt="Fresh vegetables background"
        className="absolute top-0 left-0 z-10 h-full w-full object-cover"
        fill
        priority
      />

      {/* Overlay */}
      <div className="absolute top-0 left-0 z-20 h-full w-full bg-green-800/80" />

      {/* Content */}
      <div className="relative z-30 max-w-full px-4 text-center sm:px-6 lg:max-w-[575px] lg:pr-8 lg:pl-24 lg:text-left xl:pl-[93px]">
        <div className="mb-4 font-['Playfair_Display'] text-xl leading-tight font-bold text-white sm:mb-5 sm:text-2xl md:text-3xl lg:mb-[22px] lg:text-4xl lg:leading-[72px] xl:text-[54px]">
          Transforma tu vida con Verde Guide
        </div>

        <div className="mb-6 font-['Playfair_Display'] text-sm leading-relaxed font-normal text-white sm:mb-8 sm:text-base md:text-lg md:leading-[34px] lg:mb-[22px] lg:text-xl">
          Únete a nuestra comunidad y descubre todo lo que Verde Guide tiene para ofrecerte. Desde
          restaurantes hasta profesionales de la salud, todo en un solo lugar.
        </div>

        {/* Quick features list */}
        <div className="mb-6 sm:mb-8 lg:mb-[22px]">
          <div className="grid grid-cols-1 gap-2 text-sm text-white sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>✅ Acceso gratuito completo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>📱 App móvil incluida</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>👥 Comunidad activa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>🏥 Profesionales verificados</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
          <Button className="h-12 w-[140px] touch-manipulation rounded-3xl border-0 bg-green-500 font-['Playfair_Display'] text-sm font-bold text-white shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] hover:bg-green-600 sm:w-[134px] sm:text-base">
            Crear Cuenta
          </Button>
          <Button
            variant="outline"
            className="h-12 w-[140px] rounded-3xl border-2 border-white font-['Playfair_Display'] text-sm font-bold text-white hover:bg-white hover:text-green-600 sm:w-[134px] sm:text-base"
          >
            Explorar
          </Button>
        </div>
      </div>

      {/* Side decorative images - hidden on mobile for better performance */}
      <Image
        src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
        alt="Plant-based meal"
        className="absolute top-0 right-0 z-20 hidden h-full w-[657px] object-cover opacity-60 xl:block"
        width={657}
        height={574}
      />

      <Image
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt="Healthy bowl"
        className="absolute top-[54px] right-[173px] z-30 hidden h-[467px] w-[300px] rounded-lg object-cover shadow-[0px_10px_12px_0px_rgba(0,0,0,0.34)] xl:block"
        width={300}
        height={467}
      />
    </div>
  );
}
