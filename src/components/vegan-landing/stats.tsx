"use client";

const stats = [
  {
    number: "10,000+",
    label: "Usuarios Activos",
    description: "Personas que confían en Verde Guide"
  },
  {
    number: "500+",
    label: "Restaurantes",
    description: "Establecimientos veganos verificados"
  },
  {
    number: "2,000+",
    label: "Recetas",
    description: "Platos deliciosos y nutritivos"
  },
  {
    number: "100+",
    label: "Doctores",
    description: "Profesionales especializados"
  },
  {
    number: "50+",
    label: "Mercados",
    description: "Productores locales y orgánicos"
  },
  {
    number: "25+",
    label: "Santuarios",
    description: "Organizaciones apoyadas"
  }
];

export function Stats() {
  return (
    <div className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-24 xl:px-[93px] bg-green-600">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-white font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Verde Guide en números
          </h2>
          <p className="text-green-100 font-['Playfair_Display'] text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Nuestra comunidad crece cada día, conectando personas, restaurantes y profesionales 
            comprometidos con el estilo de vida vegano.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-white font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                {stat.number}
              </div>
              <div className="text-green-100 font-['Playfair_Display'] text-sm sm:text-base font-semibold mb-1">
                {stat.label}
              </div>
              <div className="text-green-200 text-xs sm:text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-white font-['Playfair_Display'] text-2xl font-bold mb-4">
              ¿Por qué elegir Verde Guide?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-green-100">
              <div>
                <div className="text-2xl mb-2">✅</div>
                <h4 className="font-semibold mb-2">Verificado</h4>
                <p className="text-sm">Todos nuestros establecimientos y profesionales están verificados</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🔄</div>
                <h4 className="font-semibold mb-2">Actualizado</h4>
                <p className="text-sm">Información en tiempo real y actualizaciones constantes</p>
              </div>
              <div>
                <div className="text-2xl mb-2">🤝</div>
                <h4 className="font-semibold mb-2">Comunitario</h4>
                <p className="text-sm">Construido por y para la comunidad vegana</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 