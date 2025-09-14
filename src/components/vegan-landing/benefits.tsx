"use client";

import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: "🥗",
    title: "Recetas Verificadas",
    description:
      "Miles de recetas probadas y aprobadas por nuestra comunidad, con información nutricional detallada y opciones para todas las dietas.",
  },
  {
    icon: "📍",
    title: "Ubicación Inteligente",
    description:
      "Encuentra restaurantes, mercados y doctores cerca de ti con nuestro sistema de geolocalización avanzado y filtros personalizados.",
  },
  {
    icon: "👥",
    title: "Comunidad Activa",
    description:
      "Conecta con miles de personas que comparten tu pasión. Comparte experiencias, consejos y encuentra apoyo en tu viaje vegano.",
  },
  {
    icon: "📱",
    title: "App Nativa",
    description:
      "Accede a todas las funcionalidades desde tu móvil. Instala como PWA y disfruta de una experiencia offline completa.",
  },
  {
    icon: "🏥",
    title: "Salud Integral",
    description:
      "Conecta con profesionales especializados en nutrición vegana. Consultas online, seguimiento médico y recomendaciones personalizadas.",
  },
  {
    icon: "🌱",
    title: "Sostenibilidad",
    description:
      "Reduce tu huella de carbono con opciones locales y orgánicas. Apoya productores sostenibles y causas ambientales.",
  },
];

export function Benefits() {
  return (
    <div className="bg-gradient-to-b from-white to-green-50 px-4 py-12 text-center sm:px-6 sm:py-16 md:py-20 lg:px-24 lg:py-[82px] xl:px-[93px]">
      <div className="mb-4 font-['Playfair_Display'] text-2xl leading-tight font-bold text-green-800 sm:text-3xl md:text-4xl lg:text-[54px]">
        ¿Por qué elegir Verde Guide?
      </div>

      <div className="mx-auto mb-8 max-w-3xl font-['Playfair_Display'] text-sm leading-relaxed font-normal text-gray-600 sm:mb-12 sm:text-base md:text-xl md:leading-[34px] lg:mb-[66px]">
        No solo te ayudamos a encontrar opciones veganas, te proporcionamos todo el ecosistema que
        necesitas para un estilo de vida saludable y sostenible.
      </div>

      <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-6 sm:mb-20 sm:grid-cols-2 sm:gap-8 lg:mb-[154px] lg:grid-cols-3">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="mx-auto h-auto min-h-[280px] w-full max-w-[350px] rounded-xl border border-green-200/60 bg-white p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8"
          >
            <div className="mb-4 text-5xl sm:mb-6">{benefit.icon}</div>

            <div className="mb-3 font-['Playfair_Display'] text-xl leading-tight font-bold text-green-800 sm:text-2xl">
              {benefit.title}
            </div>

            <div className="font-['Playfair_Display'] text-sm leading-relaxed font-normal text-gray-600 sm:text-base">
              {benefit.description}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mb-6 max-w-2xl font-['Playfair_Display'] text-base font-normal text-gray-600 sm:text-xl">
        <span>Únete a miles de personas que ya están transformando sus vidas con Verde Guide.</span>
        <br className="hidden sm:block" />
        <span className="ml-1 sm:ml-0">Comienza tu viaje hoy mismo.</span>
      </div>

      <Button className="h-12 w-[140px] touch-manipulation rounded-3xl border-0 bg-green-500 font-['Playfair_Display'] text-sm font-bold text-white shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] hover:bg-green-600 sm:w-[134px] sm:text-base">
        Únete Ahora
      </Button>
    </div>
  );
}
