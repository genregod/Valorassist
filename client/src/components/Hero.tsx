// client/src/components/Hero.tsx
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ClaimForm } from "@/components/ClaimForm";

// The "export" keyword was likely missing here.
export function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-navy text-white">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gold">
                AI-Powered Support for Veterans' Claims
              </h1>
              <p className="max-w-[600px] text-gray-300 md:text-xl">
                Valor Assist streamlines the VA claims process, helping you get
                the benefits you've earned. Faster, easier, and with expert
                guidance.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                href="/#how-it-works"
                className="inline-flex h-10 items-center justify-center rounded-md bg-gold px-8 text-sm font-medium text-navy shadow transition-colors hover:bg-gold/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Learn More
              </Link>
              <Link
                href="/#demo"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-transparent px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                See a Demo
              </Link>
            </div>
          </div>
          <div className="w-full max-w-md mx-auto">
            <ClaimForm />
          </div>
        </div>
      </div>
    </section>
  );
}