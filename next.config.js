/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración experimental compatible con Next.js 15
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Configuración de imágenes mejorada
  images: {
    // Configurar loader personalizado para evitar errores
    loader: "default",
    loaderFile: undefined,
    // Patrones remotos expandidos
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Configuración de optimización
    unoptimized: false,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuración de tamaños para mejorar rendimiento
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Configuración de formato
    formats: ["image/webp", "image/avif"],
    // Configuración de carga
    minimumCacheTTL: 60,
  },
  // Variables de entorno
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Configuración para manejo de hidratación
  ...(process.env.NODE_ENV === "development" && {
    onDemandEntries: {
      maxInactiveAge: 60000,
      pagesBufferLength: 5,
    },
  }),
  // Configuración de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Configuración de PWA
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
    ];
  },
  // Configuración de transpilación
  transpilePackages: ["lucide-react"],
  // Configuración adicional para estabilidad
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = nextConfig;
