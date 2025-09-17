"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginModal, RegisterModal } from "@/components/auth/auth-modal";
import { useAuthStore } from "@/lib/store/auth";
import * as authApi from "@/lib/api/auth";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Recipes", href: "/recipes" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Businesses", href: "/businesses" },
  { label: "Doctors", href: "/doctors" },
  { label: "Markets", href: "/markets" },
  { label: "Community", href: "/community" },
  { label: "Map", href: "/map" },
  { label: "Recommendations", href: "/recommendations" },
  { label: "Achievements", href: "/achievements" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, setUser } = useAuthStore();
  const isAuth = !!user;

  const handleLogout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <header className="bg-background sticky top-0 z-50 w-full overflow-x-auto shadow-sm">
      <div className="flex h-16 w-full items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="font-brand-script text-primary hover:text-primary/80 text-3xl transition-colors duration-200">
            Verde Guide
          </span>
        </Link>

        {/* Navigation + Auth */}
        <nav className="mx-6 hidden flex-1 overflow-x-auto lg:flex">
          <ul className="flex h-16 flex-nowrap items-center space-x-4 whitespace-nowrap">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="flex-shrink-0">
                <Link
                  href={item.href}
                  className="group font-brand-serif text-foreground/70 hover:text-primary focus-visible:ring-ring/50 relative px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none"
                  aria-current={item.href === "/" ? "page" : undefined}
                >
                  {item.label}
                  <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}

            {/* Sign In / Sign Out / Join Us */}
            {!isAuth ? (
              <>
                <li className="flex-shrink-0">
                  <LoginModal
                    trigger={
                      <button className="group font-brand-serif text-foreground/70 hover:text-primary focus-visible:ring-ring/50 relative px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none">
                        Sign In
                        <span className="bg-primary absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full" />
                      </button>
                    }
                  />
                </li>
                <li className="flex-shrink-0">
                  <RegisterModal
                    trigger={
                      <Button className="bg-primary font-brand-serif text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 transform rounded-full px-6 py-2 text-sm font-medium shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-[3px] focus-visible:outline-none">
                        Join Us
                      </Button>
                    }
                  />
                </li>
              </>
            ) : (
              <li className="flex flex-shrink-0 items-center space-x-4">
                <span className="font-brand-serif text-foreground text-sm font-medium">
                  Welcome, {user.username}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-border font-brand-serif text-foreground hover:border-foreground hover:bg-foreground hover:text-background focus-visible:ring-ring/50 rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  Logout
                </Button>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          className="text-foreground focus-visible:ring-ring/50 ml-auto min-h-[40px] min-w-[40px] p-2 focus-visible:ring-[3px] focus-visible:outline-none lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav id="mobile-menu" className="border-border bg-background border-t shadow-lg lg:hidden">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((it) => (
              <li key={it.href} className="border-border/50 border-b last:border-b-0">
                <Link
                  href={it.href}
                  className="font-brand-serif text-foreground hover:bg-muted hover:text-primary focus-visible:ring-ring/50 block px-6 py-4 text-base font-medium transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none"
                >
                  {it.label}
                </Link>
              </li>
            ))}
            {!isAuth ? (
              <>
                <li className="border-border/50 border-b">
                  <LoginModal
                    trigger={
                      <button className="font-brand-serif text-foreground hover:text-primary focus-visible:ring-ring/50 w-full px-6 py-4 text-left text-base font-medium transition-colors duration-200 focus-visible:ring-[3px] focus-visible:outline-none">
                        Sign In
                      </button>
                    }
                  />
                </li>
                <li className="border-border/50 border-b">
                  <RegisterModal
                    trigger={
                      <Button className="bg-primary font-brand-serif text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring/50 w-full transform rounded-lg py-3 text-base font-medium shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:outline-none">
                        Join Us
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
                  Logout
                </Button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
