"use client";

import { Header } from "./header";
import { Hero } from "./hero";
import { About } from "./about";
import { Features } from "./features";
import { Stats } from "./stats";
import { RecipeShowcase } from "./recipe-showcase";
import { Benefits } from "./benefits";
import { CallToAction } from "./cta";
import { Testimonials } from "./testimonials";
import { Newsletter } from "./newsletter";
import { Footer } from "./footer";

export function VeganLandingPage() {
  return (
    <div className="w-full min-h-screen relative overflow-x-hidden bg-[#FFFEFC]">
      {/* Hero Section with Header */}
      <div className="relative">
        <Header />
        <Hero />
      </div>

      {/* Main Content Sections */}
      <About />
      <Features />
      <Stats />
      <RecipeShowcase />
      <Benefits />
      <CallToAction />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
}
