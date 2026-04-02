"use client";

import Link from "next/link";
import {
  Leaf,
  Home,
  Search,
  UtensilsCrossed,
  BookOpen,
  Stethoscope,
  ShoppingBasket,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

const SUGGESTED_LINKS = [
  { href: "/restaurants", labelKey: "resources.restaurants", icon: UtensilsCrossed },
  { href: "/recipes", labelKey: "resources.recipes", icon: BookOpen },
  { href: "/doctors", labelKey: "resources.doctors", icon: Stethoscope },
  { href: "/markets", labelKey: "resources.markets", icon: ShoppingBasket },
  { href: "/community", labelKey: "resources.community", icon: Users },
] as const;

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-white to-white px-4 py-16">
      {/* Brand mark */}
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-200">
          <Leaf className="h-10 w-10 text-white" aria-hidden="true" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-semibold tracking-widest text-emerald-600 uppercase">
          Verde Guide
        </span>
      </div>

      {/* 404 hero number */}
      <p
        className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 bg-clip-text text-[9rem] leading-none font-extrabold tracking-tight text-transparent select-none sm:text-[12rem]"
        aria-hidden="true"
      >
        404
      </p>

      {/* Divider leaf accent */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px w-16 bg-emerald-200" />
        <Leaf className="h-5 w-5 text-emerald-400" aria-hidden="true" strokeWidth={1.5} />
        <div className="h-px w-16 bg-emerald-200" />
      </div>

      {/* Main content card */}
      <div className="bg-card border-border w-full max-w-md rounded-2xl border p-8 text-center shadow-xl">
        <h1 className="text-foreground mb-3 text-2xl font-bold tracking-tight">
          {t("notFound.title")}
        </h1>
        <p className="text-muted-foreground mb-8 text-base leading-relaxed">
          {t("notFound.subtitle")}
        </p>

        {/* Primary actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            size="lg"
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500"
          >
            <Link href="/">
              <Home className="h-5 w-5" aria-hidden="true" />
              {t("notFound.goHome")}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Link href="/search">
              <Search className="h-5 w-5" aria-hidden="true" />
              {t("notFound.search")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Suggested links */}
      <div className="mt-10 w-full max-w-md">
        <p className="text-muted-foreground/60 mb-4 text-center text-xs font-semibold tracking-widest uppercase">
          {t("notFound.explore")}
        </p>
        <nav aria-label="Secciones sugeridas">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="list">
            {SUGGESTED_LINKS.map(({ href, labelKey, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="bg-card border-border text-muted-foreground flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <Icon
                    className="h-4 w-4 flex-shrink-0 text-emerald-500"
                    aria-hidden="true"
                    strokeWidth={1.75}
                  />
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Footer note */}
      <p className="text-muted-foreground/60 mt-10 text-xs">
        {t("notFound.needHelp")}{" "}
        <Link
          href="/"
          className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
        >
          {t("notFound.contactUs")}
        </Link>
        .
      </p>
    </div>
  );
}
