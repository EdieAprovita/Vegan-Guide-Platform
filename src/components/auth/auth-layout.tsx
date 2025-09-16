"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative container grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 md:top-8 md:left-8">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
            <Image
              src="/logo.svg"
              alt="Verde Guide Logo"
              width={24}
              height={24}
              className="text-white"
            />
          </div>
          <span className="font-['Clicker_Script'] text-[28px] font-normal text-green-600 transition-colors group-hover:text-green-700 sm:text-[35px]">
            Vegan Guide
          </span>
        </Link>
      </div>
      <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        <div
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2940&auto=format&fit=crop)",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="font-['Playfair_Display'] text-lg">
              &ldquo;Join our community and discover the best vegan places, recipes, and
              professionals.&rdquo;
            </p>
            <footer className="font-['Playfair_Display'] text-sm">Verde Guide Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  );
}
