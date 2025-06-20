"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function About() {
  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-[82px] px-4 sm:px-6 lg:px-24 xl:px-[93px] flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-[95px] relative">
      <div className="flex-1 max-w-full lg:max-w-[585px] relative z-20 text-center lg:text-left">
        <div className="text-green-800 font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-[54px] font-bold mb-4 sm:mb-6 lg:mb-[33px] leading-tight">
          Más que una plataforma, una comunidad
        </div>

        <div className="text-gray-600 font-['Playfair_Display'] text-sm sm:text-base md:text-xl font-normal leading-relaxed md:leading-[34px] mb-8 sm:mb-12 lg:mb-[68px]">
          Verde Guide nació de la visión de crear un ecosistema completo para el estilo de vida vegano. 
          No solo te ayudamos a encontrar restaurantes y recetas, sino que te conectamos con profesionales 
          de la salud, productores locales y una comunidad apasionada que comparte tus valores.
        </div>

        {/* Key benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 sm:mb-12 lg:mb-[68px]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-green-600 text-lg">🌱</span>
            </div>
            <div>
              <h4 className="font-['Playfair_Display'] font-bold text-green-800 mb-1">Salud Integral</h4>
              <p className="text-gray-600 text-sm">Acceso a profesionales especializados en nutrición vegana</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-green-600 text-lg">🌍</span>
            </div>
            <div>
              <h4 className="font-['Playfair_Display'] font-bold text-green-800 mb-1">Impacto Ambiental</h4>
              <p className="text-gray-600 text-sm">Reduce tu huella de carbono con opciones sostenibles</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-green-600 text-lg">🤝</span>
            </div>
            <div>
              <h4 className="font-['Playfair_Display'] font-bold text-green-800 mb-1">Comunidad</h4>
              <p className="text-gray-600 text-sm">Conecta con personas que comparten tus valores</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-green-600 text-lg">💚</span>
            </div>
            <div>
              <h4 className="font-['Playfair_Display'] font-bold text-green-800 mb-1">Compasión</h4>
              <p className="text-gray-600 text-sm">Apoya santuarios y causas por los derechos animales</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-start">
          <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm sm:text-base font-bold w-[140px] sm:w-[134px] h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0 touch-manipulation">
            Conoce Más
          </Button>
        </div>
      </div>

      <div className="w-full max-w-[400px] sm:max-w-[500px] lg:w-[500px] h-[280px] sm:h-[350px] lg:h-[484px] relative overflow-hidden bg-green-100 rounded-lg shadow-lg">
        <Image
          src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
          alt="Colorful plant-based meal prep containers"
          className="w-full h-full object-cover"
          width={500}
          height={484}
        />
      </div>
    </div>
  );
}
