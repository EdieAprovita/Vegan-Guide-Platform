// @ts-check
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración experimental compatible con Next.js 15
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
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
    contentDispositionType: "attachment",
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
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
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
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.pexels.com https://images.unsplash.com https://via.placeholder.com",
              "font-src 'self'",
              `connect-src 'self' ${apiUrl}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  // Configuración adicional para estabilidad
  poweredByHeader: false,
  generateEtags: false,
};

module.exports = withBundleAnalyzer(nextConfig);
