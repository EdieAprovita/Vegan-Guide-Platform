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
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configuración de tamaños para mejorar rendimiento
    // Tightened to reduce unique cache variants (CVE mitigation: GHSA-3x4c-7xq6-9pq8)
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128],
    // Configuración de formato
    formats: ["image/webp", "image/avif"],
    // Increased TTL to maximise cache reuse and reduce unique variants written to disk
    // (CVE mitigation: GHSA-3x4c-7xq6-9pq8 — unbounded disk cache)
    minimumCacheTTL: 3600,
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
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
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
      // Baseline CSP for public routes NOT covered by the auth middleware matcher.
      // The middleware already injects a richer nonce-based CSP for protected routes;
      // this catches /, /restaurants, /recipes, etc. without running auth() on them.
      {
        source: "/((?!api|_next).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;",
          },
        ],
      },
      // Baseline CSP for public routes NOT covered by the auth middleware matcher.
      // The middleware injects a richer nonce-based CSP for protected routes;
      // this covers /, /restaurants, /recipes, etc. without running auth() on them.
      {
        source: "/((?!api|_next).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;",
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
        ],
      },
    ];
  },
  // Suppress webpack warnings for optional OpenTelemetry packages that are not
  // installed in CI or production. instrumentation.ts wraps all requires in a
  // try/catch, so the server starts cleanly — these are purely build-time noise.
  webpack(config, { isServer }) {
    if (isServer) {
      config.ignoreWarnings = [
        ...(config.ignoreWarnings ?? []),
        {
          module: /instrumentation\.ts/,
          message: /Module not found: Can't resolve '@opentelemetry\//,
        },
      ];
    }
    return config;
  },
  // Configuración adicional para estabilidad
  poweredByHeader: false,
  generateEtags: false,
};

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(withBundleAnalyzer(nextConfig), {
  silent: true,
  hideSourceMaps: true,
});
