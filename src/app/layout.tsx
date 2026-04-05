import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Inter, JetBrains_Mono, Clicker_Script, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { InstallPrompt } from "@/components/features/pwa/install-prompt";
import { DebugInfo } from "@/components/ui/debug-info";
import { Header } from "@/components/vegan-landing/header";
import { WebVitalsReporter } from "@/components/performance/_web-vitals-loader";
import { env } from "@/lib/env";

const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const clickerScript = Clicker_Script({
  variable: "--font-clicker-script",
  subsets: ["latin"],
  weight: "400",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Verde Guide - Tu Compañero Definitivo para el Estilo de Vida Vegano",
  description:
    "Descubre restaurantes veganos, recetas nutritivas, doctores especializados, mercados orgánicos y únete a una comunidad comprometida con la salud y la sostenibilidad. Todo lo que necesitas para tu viaje vegano en un solo lugar.",
  keywords: [
    "vegano",
    "restaurantes veganos",
    "recetas veganas",
    "doctores veganos",
    "mercados orgánicos",
    "nutrición vegana",
    "comunidad vegana",
    "estilo de vida vegano",
    "santuario de animales",
    "productos veganos",
  ],
  authors: [{ name: "Verde Guide Team" }],
  creator: "Verde Guide",
  publisher: "Verde Guide",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Verde Guide",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Verde Guide - Tu Compañero Definitivo para el Estilo de Vida Vegano",
    description:
      "Descubre restaurantes veganos, recetas nutritivas, doctores especializados, mercados orgánicos y únete a una comunidad comprometida con la salud y la sostenibilidad.",
    type: "website",
    locale: "es_ES",
    siteName: "Verde Guide",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "Verde Guide Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Verde Guide - Tu Compañero Definitivo para el Estilo de Vida Vegano",
    description:
      "Descubre restaurantes veganos, recetas nutritivas, doctores especializados, mercados orgánicos y únete a una comunidad comprometida con la salud y la sostenibilidad.",
    images: ["/logo-512.png"],
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logo-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* msapplication tags are not covered by the Next.js metadata API */}
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${clickerScript.variable} ${playfairDisplay.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Skip navigation link — visible only on keyboard focus */}
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none"
        >
          Saltar al contenido principal
        </a>

        <Providers>
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <InstallPrompt />
          {process.env.NODE_ENV === "development" && <DebugInfo />}
          <WebVitalsReporter />
        </Providers>
      </body>
    </html>
  );
}
