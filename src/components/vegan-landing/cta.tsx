"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function CallToAction() {
  return (
    <div className="w-full h-[400px] sm:h-[500px] lg:h-[574px] relative flex items-center">
      {/* Background Image */}
      <Image
        src="https://images.pexels.com/photos/750952/pexels-photo-750952.jpeg"
        alt="Fresh vegetables background"
        className="w-full h-full object-cover absolute top-0 left-0 z-10"
        fill
        priority
      />

      {/* Overlay */}
      <div className="w-full h-full absolute top-0 left-0 z-20 bg-green-800/80" />

      {/* Content */}
      <div className="relative z-30 px-4 sm:px-6 lg:pl-24 xl:pl-[93px] lg:pr-8 max-w-full lg:max-w-[575px] text-center lg:text-left">
        <div className="text-white font-['Playfair_Display'] text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[54px] font-bold leading-tight lg:leading-[72px] mb-4 sm:mb-5 lg:mb-[22px]">
          Transforma tu vida con Verde Guide
        </div>

        <div className="text-white font-['Playfair_Display'] text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-relaxed md:leading-[34px] mb-6 sm:mb-8 lg:mb-[22px]">
          Únete a nuestra comunidad y descubre todo lo que Verde Guide tiene para ofrecerte. 
          Desde restaurantes hasta profesionales de la salud, todo en un solo lugar.
        </div>

        {/* Quick features list */}
        <div className="mb-6 sm:mb-8 lg:mb-[22px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>✅ Acceso gratuito completo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>📱 App móvil incluida</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>👥 Comunidad activa</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>🏥 Profesionales verificados</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm sm:text-base font-bold w-[140px] sm:w-[134px] h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0 touch-manipulation">
            Crear Cuenta
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 font-['Playfair_Display'] text-sm sm:text-base font-bold w-[140px] sm:w-[134px] h-12 rounded-3xl border-2">
            Explorar
          </Button>
        </div>
      </div>

      {/* Side decorative images - hidden on mobile for better performance */}
      <Image
        src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
        alt="Plant-based meal"
        className="absolute right-0 top-0 z-20 w-[657px] h-full object-cover opacity-60 hidden xl:block"
        width={657}
        height={574}
      />

      <Image
        src="https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg"
        alt="Healthy bowl"
        className="absolute right-[173px] top-[54px] z-30 w-[300px] h-[467px] object-cover shadow-[0px_10px_12px_0px_rgba(0,0,0,0.34)] rounded-lg hidden xl:block"
        width={300}
        height={467}
      />
    </div>
  );
}
