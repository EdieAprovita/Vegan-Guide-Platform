"use client";

import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";

export function About() {
  return (
    <div className="relative flex flex-col items-center gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 md:py-20 lg:flex-row lg:gap-[95px] lg:px-24 lg:py-[82px] xl:px-[93px]">
      <div className="relative z-20 max-w-full flex-1 text-center lg:max-w-[585px] lg:text-left">
        <div className="mb-4 font-['Playfair_Display'] text-2xl leading-tight font-bold text-green-800 sm:mb-6 sm:text-3xl md:text-4xl lg:mb-[33px] lg:text-[54px]">
          Más que una plataforma, una comunidad
        </div>

        <div className="mb-8 font-['Playfair_Display'] text-sm leading-relaxed font-normal text-gray-600 sm:mb-12 sm:text-base md:text-xl md:leading-[34px] lg:mb-[68px]">
          Verde Guide nació de la visión de crear un ecosistema completo para el estilo de vida
          vegano. No solo te ayudamos a encontrar restaurantes y recetas, sino que te conectamos con
          profesionales de la salud, productores locales y una comunidad apasionada que comparte tus
          valores.
        </div>

        {/* Key benefits */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:mb-12 sm:grid-cols-2 lg:mb-[68px]">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <span className="text-lg text-green-600">🌱</span>
            </div>
            <div>
              <h4 className="mb-1 font-['Playfair_Display'] font-bold text-green-800">
                Salud Integral
              </h4>
              <p className="text-sm text-gray-600">
                Acceso a profesionales especializados en nutrición vegana
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <span className="text-lg text-green-600">🌍</span>
            </div>
            <div>
              <h4 className="mb-1 font-['Playfair_Display'] font-bold text-green-800">
                Impacto Ambiental
              </h4>
              <p className="text-sm text-gray-600">
                Reduce tu huella de carbono con opciones sostenibles
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <span className="text-lg text-green-600">🤝</span>
            </div>
            <div>
              <h4 className="mb-1 font-['Playfair_Display'] font-bold text-green-800">Comunidad</h4>
              <p className="text-sm text-gray-600">
                Conecta con personas que comparten tus valores
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
              <span className="text-lg text-green-600">💚</span>
            </div>
            <div>
              <h4 className="mb-1 font-['Playfair_Display'] font-bold text-green-800">Compasión</h4>
              <p className="text-sm text-gray-600">
                Apoya santuarios y causas por los derechos animales
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-start">
          <Button className="h-12 w-[140px] touch-manipulation rounded-3xl border-0 bg-green-500 font-['Playfair_Display'] text-sm font-bold text-white shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] hover:bg-green-600 sm:w-[134px] sm:text-base">
            Conoce Más
          </Button>
        </div>
      </div>

      <div className="relative h-[280px] w-full max-w-[400px] overflow-hidden rounded-lg bg-green-100 shadow-lg sm:h-[350px] sm:max-w-[500px] lg:h-[484px] lg:w-[500px]">
        <SafeImage
          src="https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg"
          alt="Colorful plant-based meal prep containers"
          className="h-full w-full object-cover"
          width={500}
          height={484}
        />
      </div>
    </div>
  );
}
