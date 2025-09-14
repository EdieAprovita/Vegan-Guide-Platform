"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: "🍽️",
    title: "Restaurantes Veganos",
    description:
      "Descubre los mejores restaurantes veganos de tu zona. Filtra por ubicación, tipo de cocina, precios y calificaciones. Reserva mesas y lee reseñas de la comunidad.",
    benefits: [
      "Ubicación en tiempo real",
      "Reseñas verificadas",
      "Menús detallados",
      "Sistema de reservas",
    ],
  },
  {
    icon: "👨‍⚕️",
    title: "Doctores Especializados",
    description:
      "Conecta con profesionales de la salud especializados en nutrición vegana. Encuentra médicos, nutricionistas y especialistas que entienden tu estilo de vida.",
    benefits: [
      "Especialistas certificados",
      "Consultas online",
      "Historial médico",
      "Recomendaciones personalizadas",
    ],
  },
  {
    icon: "🥗",
    title: "Recetas Nutritivas",
    description:
      "Explora miles de recetas veganas deliciosas y nutritivas. Desde platos simples hasta gourmet, todas con información nutricional detallada y pasos claros.",
    benefits: [
      "Filtros por dieta",
      "Información nutricional",
      "Videos tutoriales",
      "Guardado de favoritos",
    ],
  },
  {
    icon: "🛒",
    title: "Mercados Orgánicos",
    description:
      "Encuentra mercados, tiendas orgánicas y productores locales. Compra productos frescos, orgánicos y de temporada directamente de los agricultores.",
    benefits: [
      "Productos locales",
      "Entrega a domicilio",
      "Calendario de temporada",
      "Precios competitivos",
    ],
  },
  {
    icon: "🏢",
    title: "Negocios Veganos",
    description:
      "Descubre empresas y servicios comprometidos con el estilo de vida vegano. Desde ropa hasta cosméticos, encuentra todo lo que necesitas.",
    benefits: [
      "Categorías diversas",
      "Envío nacional",
      "Garantías veganas",
      "Soporte especializado",
    ],
  },
  {
    icon: "🦋",
    title: "Santuarios de Animales",
    description:
      "Conoce y apoya santuarios de animales en tu área. Visita, dona o participa en eventos para ayudar a los animales rescatados.",
    benefits: [
      "Visitas guiadas",
      "Programas de voluntariado",
      "Donaciones seguras",
      "Eventos especiales",
    ],
  },
  {
    icon: "💬",
    title: "Comunidad Activa",
    description:
      "Únete a una comunidad vibrante de personas que comparten tu pasión por el veganismo. Comparte experiencias, consejos y apoya a otros en su viaje.",
    benefits: ["Foros temáticos", "Grupos locales", "Eventos comunitarios", "Mentoría"],
  },
  {
    icon: "📱",
    title: "Aplicación Móvil",
    description:
      "Accede a todas las funcionalidades desde tu dispositivo móvil. Instala la app como PWA y disfruta de una experiencia nativa sin descargas.",
    benefits: ["Funciona offline", "Notificaciones push", "Sincronización", "Interfaz optimizada"],
  },
];

export function Features() {
  return (
    <div className="bg-gradient-to-b from-green-50 to-white px-4 py-16 sm:px-6 sm:py-20 lg:px-24 lg:py-24 xl:px-[93px]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-['Playfair_Display'] text-3xl font-bold text-green-800 sm:text-4xl lg:text-5xl">
            Todo lo que necesitas para tu estilo de vida vegano
          </h2>
          <p className="mx-auto max-w-3xl font-['Playfair_Display'] text-lg leading-relaxed text-gray-600 sm:text-xl">
            Verde Guide es tu plataforma integral que conecta todos los aspectos del veganismo en un
            solo lugar. Desde encontrar restaurantes hasta conectar con la comunidad, tenemos todo
            cubierto.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            >
              <CardHeader className="pb-4">
                <div className="mb-3 text-4xl">{feature.icon}</div>
                <CardTitle className="font-['Playfair_Display'] text-xl font-bold text-green-800">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="mb-4 leading-relaxed text-gray-600">
                  {feature.description}
                </CardDescription>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div
                      key={benefitIndex}
                      className="flex items-center gap-2 text-sm text-green-700"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="rounded-2xl bg-gradient-to-r from-green-500 to-green-600 p-8 text-white sm:p-12">
            <h3 className="mb-4 font-['Playfair_Display'] text-2xl font-bold sm:text-3xl">
              ¿Listo para comenzar tu viaje vegano?
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-green-100">
              Únete a miles de personas que ya están transformando sus vidas con Verde Guide. Es
              completamente gratuito y puedes empezar ahora mismo.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button className="rounded-full bg-white px-8 py-3 font-['Playfair_Display'] font-bold text-green-600 hover:bg-green-50">
                Crear Cuenta Gratis
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white px-8 py-3 font-['Playfair_Display'] font-bold text-white hover:bg-white hover:text-green-600"
              >
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
