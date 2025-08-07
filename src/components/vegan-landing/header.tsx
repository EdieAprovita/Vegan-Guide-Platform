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
    <header className="bg-white shadow-sm sticky top-0 z-50 w-full overflow-x-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-3xl font-['Clicker_Script'] text-green-600 hover:text-green-700 transition-colors duration-200">
            Verde Guide
          </span>
        </Link>

        {/* Navigation + Auth */}
        <nav className="hidden lg:flex flex-1 overflow-x-auto mx-6">
          <ul className="flex flex-nowrap whitespace-nowrap space-x-4 items-center h-16">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="flex-shrink-0">
                <Link
                  href={item.href}
                  className="relative text-sm font-['Playfair_Display'] font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 py-2 px-3 group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}

            {/* Sign In / Sign Out / Join Us */}
            {!isAuth ? (
              <>
                <li className="flex-shrink-0">
                  <LoginModal
                    trigger={
                      <button className="relative text-sm font-['Playfair_Display'] font-medium text-gray-700 hover:text-green-600 transition-colors duration-200 py-2 px-3 group">
                        Sign In
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all duration-300 group-hover:w-full" />
                      </button>
                    }
                  />
                </li>
                <li className="flex-shrink-0">
                  <RegisterModal
                    trigger={
                      <Button className="bg-green-500 hover:bg-green-600 text-white text-sm rounded-full px-6 py-2 font-['Playfair_Display'] font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                        Join Us
                      </Button>
                    }
                  />
                </li>
              </>
            ) : (
              <li className="flex-shrink-0 flex items-center space-x-4">
                <span className="text-sm font-['Playfair_Display'] font-medium text-gray-700">
                  Welcome, {user.username}
                </span>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-gray-700 border-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-700 text-sm rounded-full px-6 py-2 font-['Playfair_Display'] font-medium transition-all duration-200"
                >
                  Logout
                </Button>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-gray-800 ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                mobileOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((it) => (
              <li key={it.href} className="border-b border-gray-100 last:border-b-0">
                <Link
                  href={it.href}
                  className="block px-6 py-4 text-base font-['Playfair_Display'] font-medium text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
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
                      <button className="w-full text-left px-6 py-4 text-base font-['Playfair_Display'] font-medium text-gray-700 hover:text-green-600 transition-colors duration-200">
                        Sign In
                      </button>
                    }
                  />
                </li>
                <li className="border-b border-gray-100">
                  <RegisterModal
                    trigger={
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white text-base font-['Playfair_Display'] font-medium py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
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
                  className="w-full text-gray-700 border-gray-300 hover:bg-gray-700 hover:text-white font-['Playfair_Display'] font-medium py-3 rounded-lg transition-all duration-200"
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
