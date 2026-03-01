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
    <div className="bg-background relative min-h-screen w-full overflow-x-hidden">
      {/* Hero Section — Header is rendered globally in RootLayout */}
      <div className="relative">
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
