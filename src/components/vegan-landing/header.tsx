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
    <header className="sticky top-0 z-50 w-full overflow-x-auto bg-white shadow-sm">
      <div className="flex h-16 w-full items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="font-['Clicker_Script'] text-3xl text-green-600 transition-colors duration-200 hover:text-green-700">
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
                  className="group relative px-3 py-2 font-['Playfair_Display'] text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-green-600"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-green-600 transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}

            {/* Sign In / Sign Out / Join Us */}
            {!isAuth ? (
              <>
                <li className="flex-shrink-0">
                  <LoginModal
                    trigger={
                      <button className="group relative px-3 py-2 font-['Playfair_Display'] text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-green-600">
                        Sign In
                        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-green-600 transition-all duration-300 group-hover:w-full" />
                      </button>
                    }
                  />
                </li>
                <li className="flex-shrink-0">
                  <RegisterModal
                    trigger={
                      <Button className="transform rounded-full bg-green-500 px-6 py-2 font-['Playfair_Display'] text-sm font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-xl">
                        Join Us
                      </Button>
                    }
                  />
                </li>
              </>
            ) : (
              <li className="flex flex-shrink-0 items-center space-x-4">
                <span className="font-['Playfair_Display'] text-sm font-medium text-gray-700">
                  Welcome, {user.username}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="rounded-full border-gray-300 px-6 py-2 font-['Playfair_Display'] text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-700 hover:bg-gray-700 hover:text-white"
                >
                  Logout
                </Button>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          className="ml-auto p-2 text-gray-800 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
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
        <nav className="border-t border-gray-200 bg-white shadow-lg lg:hidden">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((it) => (
              <li key={it.href} className="border-b border-gray-100 last:border-b-0">
                <Link
                  href={it.href}
                  className="block px-6 py-4 font-['Playfair_Display'] text-base font-medium text-gray-700 transition-colors duration-200 hover:bg-green-50 hover:text-green-600"
                >
                  {it.label}
                </Link>
              </li>
            ))}
            {!isAuth ? (
              <>
                <li className="border-b border-gray-100">
                  <LoginModal
                    trigger={
                      <button className="w-full px-6 py-4 text-left font-['Playfair_Display'] text-base font-medium text-gray-700 transition-colors duration-200 hover:text-green-600">
                        Sign In
                      </button>
                    }
                  />
                </li>
                <li className="border-b border-gray-100">
                  <RegisterModal
                    trigger={
                      <Button className="w-full transform rounded-lg bg-green-500 py-3 font-['Playfair_Display'] text-base font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-600">
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
                  className="w-full rounded-lg border-gray-300 py-3 font-['Playfair_Display'] font-medium text-gray-700 transition-all duration-200 hover:bg-gray-700 hover:text-white"
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
