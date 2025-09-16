"use client";

const stats = [
  {
    number: "10,000+",
    label: "Usuarios Activos",
    description: "Personas que confían en Verde Guide",
  },
  {
    number: "500+",
    label: "Restaurantes",
    description: "Establecimientos veganos verificados",
  },
  {
    number: "2,000+",
    label: "Recetas",
    description: "Platos deliciosos y nutritivos",
  },
  {
    number: "100+",
    label: "Doctores",
    description: "Profesionales especializados",
  },
  {
    number: "50+",
    label: "Mercados",
    description: "Productores locales y orgánicos",
  },
  {
    number: "25+",
    label: "Santuarios",
    description: "Organizaciones apoyadas",
  },
];

export function Stats() {
  return (
    <div className="bg-green-600 px-4 py-16 sm:px-6 sm:py-20 lg:px-24 lg:py-24 xl:px-[93px]">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-['Playfair_Display'] text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Verde Guide en números
          </h2>
          <p className="mx-auto max-w-3xl font-['Playfair_Display'] text-lg leading-relaxed text-green-100 sm:text-xl">
            Nuestra comunidad crece cada día, conectando personas, restaurantes y profesionales
            comprometidos con el estilo de vida vegano.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 font-['Playfair_Display'] text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {stat.number}
              </div>
              <div className="mb-1 font-['Playfair_Display'] text-sm font-semibold text-green-100 sm:text-base">
                {stat.label}
              </div>
              <div className="text-xs text-green-200 sm:text-sm">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-16 text-center">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white/10 p-8 backdrop-blur-sm">
            <h3 className="mb-4 font-['Playfair_Display'] text-2xl font-bold text-white">
              ¿Por qué elegir Verde Guide?
            </h3>
            <div className="grid grid-cols-1 gap-6 text-green-100 md:grid-cols-3">
              <div>
                <div className="mb-2 text-2xl">✅</div>
                <h4 className="mb-2 font-semibold">Verificado</h4>
                <p className="text-sm">
                  Todos nuestros establecimientos y profesionales están verificados
                </p>
              </div>
              <div>
                <div className="mb-2 text-2xl">🔄</div>
                <h4 className="mb-2 font-semibold">Actualizado</h4>
                <p className="text-sm">Información en tiempo real y actualizaciones constantes</p>
              </div>
              <div>
                <div className="mb-2 text-2xl">🤝</div>
                <h4 className="mb-2 font-semibold">Comunitario</h4>
                <p className="text-sm">Construido por y para la comunidad vegana</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
