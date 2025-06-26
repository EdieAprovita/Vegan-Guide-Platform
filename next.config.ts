import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Configuración para manejo de hidratación
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // Reducir tiempo de espera en desarrollo
      maxInactiveAge: 60000,
      pagesBufferLength: 5,
    },
  }),
  // PWA configuration
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
};

export default nextConfig;
