
import { Button } from "@/components/ui/button";
import { Shield, Star, CheckCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-navy via-navy-light to-navy-dark text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 chevron-bg opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy/50 to-navy"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center bg-gold/20 border border-gold/50 rounded-full px-6 py-2 backdrop-blur-sm">
              <Star className="h-5 w-5 text-gold mr-2" />
              <span className="text-gold font-bold text-sm">VETERAN-OWNED & OPERATED</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <span className="text-white">Veterans</span>
              </h1>
              <h2 className="text-3xl lg:text-5xl font-bold text-gold">
                let's face it...
              </h2>
              <h3 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                VA Claims are a complete
                <span className="text-red-400 block">nightmare</span>
              </h3>
            </div>

            {/* Subheading */}
            <p className="text-xl lg:text-2xl font-bold text-gold leading-relaxed">
              Frustrated with VA red tape? We've got you.
            </p>

            {/* CTA Button */}
            <div className="pt-8">
              <Button className="bg-gradient-to-r from-gold to-yellow-400 text-navy font-black text-lg px-12 py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-gold/50">
                GET THE RATING I DESERVE
              </Button>
              <p className="text-sm text-gray-300 mt-4 font-semibold">
                No more guesswork, just results.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-gold/20">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-gold" />
                <span className="text-sm font-semibold">100% Veteran-Owned</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-gold" />
                <span className="text-sm font-semibold">BBB Accredited</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-gold" />
                <span className="text-sm font-semibold">Purple Heart Partner</span>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gold/20 to-transparent rounded-3xl p-8 backdrop-blur-sm border border-gold/30">
              <div className="bg-navy-light rounded-2xl p-8 shadow-2xl">
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-br from-gold to-yellow-400 p-6 rounded-2xl mx-auto w-fit shadow-xl">
                    <Shield className="h-16 w-16 text-navy" />
                  </div>
                  <h3 className="text-2xl font-bold text-gold">
                    Your Service Matters
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Get the compensation you've earned with our expert VA claims assistance.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-gold">98%</div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gold">24/7</div>
                      <div className="text-xs text-gray-400">Support</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-gold">$0</div>
                      <div className="text-xs text-gray-400">Upfront Cost</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
