"use client";

import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: "🥗",
    title: "Recetas Verificadas",
    description: "Miles de recetas probadas y aprobadas por nuestra comunidad, con información nutricional detallada y opciones para todas las dietas.",
  },
  {
    icon: "📍",
    title: "Ubicación Inteligente",
    description: "Encuentra restaurantes, mercados y doctores cerca de ti con nuestro sistema de geolocalización avanzado y filtros personalizados.",
  },
  {
    icon: "👥",
    title: "Comunidad Activa",
    description: "Conecta con miles de personas que comparten tu pasión. Comparte experiencias, consejos y encuentra apoyo en tu viaje vegano.",
  },
  {
    icon: "📱",
    title: "App Nativa",
    description: "Accede a todas las funcionalidades desde tu móvil. Instala como PWA y disfruta de una experiencia offline completa.",
  },
  {
    icon: "🏥",
    title: "Salud Integral",
    description: "Conecta con profesionales especializados en nutrición vegana. Consultas online, seguimiento médico y recomendaciones personalizadas.",
  },
  {
    icon: "🌱",
    title: "Sostenibilidad",
    description: "Reduce tu huella de carbono con opciones locales y orgánicas. Apoya productores sostenibles y causas ambientales.",
  },
];

export function Benefits() {
  return (
    <div className="py-12 sm:py-16 md:py-20 lg:py-[82px] px-4 sm:px-6 lg:px-24 xl:px-[93px] text-center bg-gradient-to-b from-white to-green-50">
      <div className="text-green-800 font-['Playfair_Display'] text-2xl sm:text-3xl md:text-4xl lg:text-[54px] font-bold mb-4 leading-tight">
        ¿Por qué elegir Verde Guide?
      </div>

      <div className="text-gray-600 font-['Playfair_Display'] text-sm sm:text-base md:text-xl font-normal leading-relaxed md:leading-[34px] mb-8 sm:mb-12 lg:mb-[66px] max-w-3xl mx-auto">
        No solo te ayudamos a encontrar opciones veganas, te proporcionamos todo el ecosistema que necesitas para un estilo de vida saludable y sostenible.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20 lg:mb-[154px] max-w-7xl mx-auto">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="w-full max-w-[350px] mx-auto h-auto min-h-[280px] border border-green-200/60 p-6 sm:p-8 text-center bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-5xl mb-4 sm:mb-6">
              {benefit.icon}
            </div>

            <div className="text-green-800 font-['Playfair_Display'] text-xl sm:text-2xl font-bold mb-3 leading-tight">
              {benefit.title}
            </div>

            <div className="text-gray-600 font-['Playfair_Display'] text-sm sm:text-base font-normal leading-relaxed">
              {benefit.description}
            </div>
          </div>
        ))}
      </div>

      <div className="text-gray-600 font-['Playfair_Display'] text-base sm:text-xl font-normal mb-6 max-w-2xl mx-auto">
        <span>
          Únete a miles de personas que ya están transformando sus vidas con Verde Guide.
        </span>
        <br className="hidden sm:block" />
        <span className="sm:ml-0 ml-1">Comienza tu viaje hoy mismo.</span>
      </div>

      <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm sm:text-base font-bold w-[140px] sm:w-[134px] h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0 touch-manipulation">
        Únete Ahora
      </Button>
    </div>
  );
}
