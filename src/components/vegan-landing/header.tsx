"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AuthModal,
  LoginModal,
  RegisterModal,
} from "@/components/auth/auth-modal";
import { useAuthStore } from "@/lib/store/auth";
import { GlobalSearch } from "@/components/features/search/global-search";
import Link from "next/link";
import { NotificationBell } from "@/components/features/notifications/notification-bell";
import { ChatButton } from "@/components/features/chat/chat-button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 sm:p-6 lg:px-24 xl:px-[93px] relative z-30">
        <div className="text-white font-['Clicker_Script'] text-[28px] sm:text-[35px] font-normal">
          Verde Guide
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-[60px]">
          <Link href="/" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Home
          </Link>
          <Link href="/recipes" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Recipes
          </Link>
          <Link href="/restaurants" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Restaurants
          </Link>
          <Link href="/doctors" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Doctors
          </Link>
          <Link href="/markets" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Markets
          </Link>
          <Link href="/community" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Community
          </Link>
          <Link href="/map" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Map
          </Link>
          <Link href="/recommendations" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Recommendations
          </Link>
          <Link href="/achievements" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Achievements
          </Link>
          {user?.isAdmin && (
            <Link href="/admin" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
              Admin
            </Link>
          )}
          {user?.isAdmin && (
            <Link href="/analytics" className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
              Analytics
            </Link>
          )}
          <div className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            About Us
          </div>
          <div className="text-white font-['Playfair_Display'] text-sm font-normal cursor-pointer hover:text-green-200 transition-colors">
            Contact Us
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <GlobalSearch />
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Desktop Auth */}
        <div className="hidden sm:flex items-center gap-4 lg:gap-[45px]">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-white font-['Playfair_Display'] text-sm">
                Welcome, {user?.username}!
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-green-800 font-['Playfair_Display'] text-xs sm:text-sm font-normal w-[80px] sm:w-[100px] h-10 sm:h-12 rounded-3xl">
                Logout
              </Button>
            </div>
          ) : (
            <>
              <LoginModal
                trigger={
                  <button className="text-white font-['Playfair_Display'] text-sm font-normal underline cursor-pointer hover:text-green-200 transition-colors">
                    Sign In
                  </button>
                }
              />
              <RegisterModal
                trigger={
                  <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-xs sm:text-sm font-normal w-[80px] sm:w-[100px] h-10 sm:h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0">
                    Join Us
                  </Button>
                }
              />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                mobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-sm z-20 border-t border-green-500/20">
          <div className="flex flex-col p-4 space-y-4">
            {/* Mobile Search */}
            <div className="md:hidden">
              <GlobalSearch />
            </div>
            
            <Link href="/" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Home
            </Link>
            <Link href="/recipes" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Recipes
            </Link>
            <Link href="/restaurants" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Restaurants
            </Link>
            <Link href="/doctors" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Doctors
            </Link>
            <Link href="/markets" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Markets
            </Link>
            <Link href="/community" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Community
            </Link>
            <Link href="/map" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Map
            </Link>
            <Link href="/recommendations" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Recommendations
            </Link>
            <Link href="/achievements" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Achievements
            </Link>
            {user?.isAdmin && (
              <Link href="/admin" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
                Admin
              </Link>
            )}
            {user?.isAdmin && (
              <Link href="/analytics" className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
                Analytics
              </Link>
            )}
            <div className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              About Us
            </div>
            <div className="text-white font-['Playfair_Display'] text-base font-normal cursor-pointer hover:text-green-200 transition-colors py-2">
              Contact Us
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-green-500/20 sm:hidden">
              {isAuthenticated ? (
                <div className="flex flex-col gap-4 w-full">
                  <span className="text-white font-['Playfair_Display'] text-sm">
                    Welcome, {user?.username}!
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-green-800 font-['Playfair_Display'] text-sm font-normal w-full h-12 rounded-3xl">
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <LoginModal
                    trigger={
                      <button className="text-white font-['Playfair_Display'] text-sm font-normal underline cursor-pointer hover:text-green-200 transition-colors">
                        Sign In
                      </button>
                    }
                  />
                  <RegisterModal
                    trigger={
                      <Button className="bg-green-500 hover:bg-green-600 text-white font-['Playfair_Display'] text-sm font-normal w-[100px] h-12 rounded-3xl shadow-[0px_6px_12px_0px_rgba(34,197,94,0.22)] border-0">
                        Join Us
                      </Button>
                    }
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        open={isAuthModalOpen} 
        onOpenChange={setIsAuthModalOpen} 
      />

      {/* Chat Button - Only show for authenticated users */}
      {isAuthenticated && <ChatButton />}
    </>
  );
}
