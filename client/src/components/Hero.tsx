
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ClaimForm } from "@/components/ClaimForm";

export function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light text-white overflow-hidden">
      {/* Military pattern overlay */}
      <div className="absolute inset-0 opacity-10 chevron-bg"></div>
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_500px] lg:gap-16 xl:grid-cols-[1fr_600px] items-center">
          <div className="text-center lg:text-left space-y-8">
            {/* Military Eagle/Shield Logo */}
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="w-20 h-20 bg-gold rounded-full flex items-center justify-center shadow-2xl">
                <img
                  alt="Valor Assist Eagle Shield"
                  className="w-12 h-12"
                  src="https://placehold.co/48x48/1a3a5c/ffc857?text=⚔️"
                />
              </div>
            </div>

            {/* Bold Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-gold leading-none">
                Veterans
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                let's face it...
              </h2>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-red-400 mb-8">
                VA Claims are a complete nightmare
              </h3>
            </div>

            {/* Subheadline */}
            <div className="space-y-4">
              <h4 className="text-2xl sm:text-3xl font-semibold text-blue-200">
                Frustrated with VA red tape? We've got you.
              </h4>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0">
                No more guesswork, just results.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Button 
                asChild
                size="lg" 
                className="bg-gold hover:bg-gold-light text-navy text-xl font-bold px-12 py-6 rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-gold"
              >
                <Link href="/#demo">
                  GET THE RATING I DESERVE
                </Link>
              </Button>
            </div>

            {/* Credentials */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-8">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-gold">BBB A+ Rated</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-gold">Purple Heart Partner</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold text-gold">Veteran Owned</span>
              </div>
            </div>
          </div>

          {/* Claim Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <ClaimForm />
          </div>
        </div>
      </div>
    </section>
  );
}
