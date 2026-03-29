"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { LoginModal, RegisterModal } from "@/components/auth/auth-modal";
import { useSession, signOut } from "next-auth/react";
import { useTranslation } from "@/lib/i18n";

type NavItemDef = { labelKey: string; href: string };

const NAV_ITEM_DEFS: NavItemDef[] = [
  { labelKey: "nav.home",            href: "/"                },
  { labelKey: "nav.recipes",         href: "/recipes"         },
  { labelKey: "nav.restaurants",     href: "/restaurants"     },
  { labelKey: "nav.businesses",      href: "/businesses"      },
  { labelKey: "nav.doctors",         href: "/doctors"         },
  { labelKey: "nav.markets",         href: "/markets"         },
  { labelKey: "nav.community",       href: "/community"       },
  { labelKey: "nav.map",             href: "/map"             },
  { labelKey: "nav.recommendations", href: "/recommendations" },
  { labelKey: "nav.achievements",    href: "/achievements"    },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuth = status === "authenticated";
  const pathname = usePathname();
  const { t } = useTranslation();

  // Refs for focus management
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);

  const handleLogout = () => {
    signOut({ redirect: false });
  };

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    // Return focus to the toggle button when menu closes
    toggleButtonRef.current?.focus();
  }, []);

  const openMobileMenu = useCallback(() => {
    setMobileOpen(true);
  }, []);

  // ESC key closes the mobile menu
  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  // Focus the first nav link when the mobile menu opens
  useEffect(() => {
    if (!mobileOpen) return;

    const firstLink = mobileMenuRef.current?.querySelector<HTMLElement>("a, button");
    if (firstLink) {
      // Defer so the DOM is painted before we attempt focus
      requestAnimationFrame(() => firstLink.focus());
    }
  }, [mobileOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="bg-background sticky top-0 z-50 w-full overflow-x-auto shadow-sm">
      <div className="flex h-16 w-full items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="font-brand-script text-primary hover:text-primary/80 text-3xl transition-colors duration-200">
            Verde Guide
          </span>
        </Link>

        {/* Desktop Navigation + Auth */}
        <nav
          aria-label="Navegación principal"
          className="mx-6 hidden flex-1 overflow-x-auto lg:flex"
        >
          <ul className="flex h-16 flex-nowrap items-center space-x-4 whitespace-nowrap">
            {NAV_ITEM_DEFS.map((item) => {
              const isCurrentPage =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <li key={item.href} className="flex-shrink-0">
                  <Link
                    href={item.href}
                    className="group font-brand-serif text-foreground/70 hover:text-primary focus-visible:ring-ring/50 relative px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none"
                    aria-current={isCurrentPage ? "page" : undefined}
                  >
                    {t(item.labelKey)}
                    <span
                      aria-hidden="true"
                      className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
                    />
                  </Link>
                </li>
              );
            })}

            {/* Sign In / Sign Out / Join Us */}
            {!isAuth ? (
              <>
                <li className="flex-shrink-0">
                  <LoginModal
                    trigger={
                      <button className="group font-brand-serif text-foreground/70 hover:text-primary focus-visible:ring-ring/50 relative px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none">
                        {t("nav.signIn")}
                        <span
                          aria-hidden="true"
                          className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full"
                        />
                      </button>
                    }
                  />
                </li>
                <li className="flex-shrink-0">
                  <RegisterModal
                    trigger={
                      <Button className="bg-primary font-brand-serif text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 transform rounded-full px-6 py-2 text-sm font-medium shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-[3px] focus-visible:outline-none">
                        {t("nav.joinUs")}
                      </Button>
                    }
                  />
                </li>
              </>
            ) : (
              <li className="flex flex-shrink-0 items-center space-x-4">
                <span className="font-brand-serif text-foreground text-sm font-medium">
                  {t("nav.welcome")}, {user?.name ?? user?.email}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-border font-brand-serif text-foreground hover:border-foreground hover:bg-foreground hover:text-background focus-visible:ring-ring/50 rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  {t("nav.signOut")}
                </Button>
              </li>
            )}

            {/* Theme Toggle + Language Toggle — desktop */}
            <li className="flex flex-shrink-0 items-center gap-1 pl-2">
              <LanguageToggle />
              <ThemeToggle />
            </li>
          </ul>
        </nav>

        {/* Mobile: language + hamburger */}
        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <LanguageToggle />
          <button
            ref={toggleButtonRef}
            className="text-foreground focus-visible:ring-ring/50 min-h-[40px] min-w-[40px] p-2 focus-visible:ring-[3px] focus-visible:outline-none"
            onClick={() => (mobileOpen ? closeMobileMenu() : openMobileMenu())}
            aria-label={mobileOpen ? t("a11y.closeMenu") : t("a11y.openMenu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
          >
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          ref={mobileMenuRef}
          role="dialog"
          aria-label="Menú de navegación"
          aria-modal="true"
          className="border-border bg-background border-t shadow-lg lg:hidden"
        >
          <ul className="flex flex-col">
            {NAV_ITEM_DEFS.map((it) => {
              const isCurrentPage =
                it.href === "/"
                  ? pathname === "/"
                  : pathname === it.href || pathname.startsWith(it.href + "/");

              return (
                <li key={it.href} className="border-border/50 border-b last:border-b-0">
                  <Link
                    href={it.href}
                    className="font-brand-serif text-foreground hover:bg-muted hover:text-primary focus-visible:ring-ring/50 block px-6 py-4 text-base font-medium transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none"
                    aria-current={isCurrentPage ? "page" : undefined}
                  >
                    {t(it.labelKey)}
                  </Link>
                </li>
              );
            })}
            {!isAuth ? (
              <>
                <li className="border-border/50 border-b">
                  <LoginModal
                    trigger={
                      <button className="font-brand-serif text-foreground hover:text-primary focus-visible:ring-ring/50 w-full px-6 py-4 text-left text-base font-medium transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none">
                        {t("nav.signIn")}
                      </button>
                    }
                  />
                </li>
                <li className="border-border/50 border-b">
                  <RegisterModal
                    trigger={
                      <Button className="bg-primary font-brand-serif text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 w-full transform rounded-lg py-3 text-base font-medium shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:outline-none">
                        {t("nav.joinUs")}
                      </Button>
                    }
                  />
                </li>
              </>
            ) : (
              <li className="p-4">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-border font-brand-serif text-foreground hover:bg-foreground hover:text-background focus-visible:ring-ring/50 w-full rounded-lg py-3 font-medium transition-all duration-200 focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  {t("nav.signOut")}
                </Button>
              </li>
            )}

            {/* Theme Toggle — mobile */}
            <li className="border-border/50 flex items-center justify-between border-t px-6 py-3">
              <span className="font-brand-serif text-foreground/70 text-sm font-medium">
                Tema
              </span>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
