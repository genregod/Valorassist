// client/src/pages/home.tsx

// The import statement below has been changed to use curly braces {}.
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Demo } from "@/components/Demo";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

// This component is now correctly named "HomePage" to match App.tsx
export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* The Header component is no longer needed here because 
          it is already rendered once for all pages in App.tsx */}
      <main className="flex-1">
        <Hero />
        <Services />
        <HowItWorks />
        <Testimonials />
        <Demo />
        <CTA />
      </main>
      {/* The Footer is also rendered once for all pages in App.tsx */}
    </div>
  );
}