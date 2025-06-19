"use client"

import Image from "next/image"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="absolute left-4 top-4 md:left-8 md:top-8 z-30 flex items-center gap-2">
        <Link href="/" className="text-green-600 font-['Clicker_Script'] text-[28px] sm:text-[35px] font-normal hover:text-green-700 transition-colors">
          Verde Guide
        </Link>
      </div>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
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
            <p className="text-lg font-['Playfair_Display']">
              &ldquo;Join our community and discover the best vegan places, recipes, and professionals.&rdquo;
            </p>
            <footer className="text-sm font-['Playfair_Display']">Verde Guide Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
        </div>
      </div>
    </div>
  )
} 