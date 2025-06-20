"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: "🍽️",
    title: "Restaurantes Veganos",
    description: "Descubre los mejores restaurantes veganos de tu zona. Filtra por ubicación, tipo de cocina, precios y calificaciones. Reserva mesas y lee reseñas de la comunidad.",
    benefits: ["Ubicación en tiempo real", "Reseñas verificadas", "Menús detallados", "Sistema de reservas"]
  },
  {
    icon: "👨‍⚕️",
    title: "Doctores Especializados",
    description: "Conecta con profesionales de la salud especializados en nutrición vegana. Encuentra médicos, nutricionistas y especialistas que entienden tu estilo de vida.",
    benefits: ["Especialistas certificados", "Consultas online", "Historial médico", "Recomendaciones personalizadas"]
  },
  {
    icon: "🥗",
    title: "Recetas Nutritivas",
    description: "Explora miles de recetas veganas deliciosas y nutritivas. Desde platos simples hasta gourmet, todas con información nutricional detallada y pasos claros.",
    benefits: ["Filtros por dieta", "Información nutricional", "Videos tutoriales", "Guardado de favoritos"]
  },
  {
    icon: "🛒",
    title: "Mercados Orgánicos",
    description: "Encuentra mercados, tiendas orgánicas y productores locales. Compra productos frescos, orgánicos y de temporada directamente de los agricultores.",
    benefits: ["Productos locales", "Entrega a domicilio", "Calendario de temporada", "Precios competitivos"]
  },
  {
    icon: "🏢",
    title: "Negocios Veganos",
    description: "Descubre empresas y servicios comprometidos con el estilo de vida vegano. Desde ropa hasta cosméticos, encuentra todo lo que necesitas.",
    benefits: ["Categorías diversas", "Envío nacional", "Garantías veganas", "Soporte especializado"]
  },
  {
    icon: "🦋",
    title: "Santuarios de Animales",
    description: "Conoce y apoya santuarios de animales en tu área. Visita, dona o participa en eventos para ayudar a los animales rescatados.",
    benefits: ["Visitas guiadas", "Programas de voluntariado", "Donaciones seguras", "Eventos especiales"]
  },
  {
    icon: "💬",
    title: "Comunidad Activa",
    description: "Únete a una comunidad vibrante de personas que comparten tu pasión por el veganismo. Comparte experiencias, consejos y apoya a otros en su viaje.",
    benefits: ["Foros temáticos", "Grupos locales", "Eventos comunitarios", "Mentoría"]
  },
  {
    icon: "📱",
    title: "Aplicación Móvil",
    description: "Accede a todas las funcionalidades desde tu dispositivo móvil. Instala la app como PWA y disfruta de una experiencia nativa sin descargas.",
    benefits: ["Funciona offline", "Notificaciones push", "Sincronización", "Interfaz optimizada"]
  }
];

export function Features() {
  return (
    <div className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-24 xl:px-[93px] bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-green-800 font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Todo lo que necesitas para tu estilo de vida vegano
          </h2>
          <p className="text-gray-600 font-['Playfair_Display'] text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Verde Guide es tu plataforma integral que conecta todos los aspectos del veganismo en un solo lugar. 
            Desde encontrar restaurantes hasta conectar con la comunidad, tenemos todo cubierto.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <CardTitle className="text-green-800 font-['Playfair_Display'] text-xl font-bold">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </CardDescription>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2 text-sm text-green-700">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
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
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 sm:p-12 text-white">
            <h3 className="font-['Playfair_Display'] text-2xl sm:text-3xl font-bold mb-4">
              ¿Listo para comenzar tu viaje vegano?
            </h3>
            <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              Únete a miles de personas que ya están transformando sus vidas con Verde Guide. 
              Es completamente gratuito y puedes empezar ahora mismo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-white text-green-600 hover:bg-green-50 font-['Playfair_Display'] font-bold px-8 py-3 rounded-full">
                Crear Cuenta Gratis
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 font-['Playfair_Display'] font-bold px-8 py-3 rounded-full">
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 