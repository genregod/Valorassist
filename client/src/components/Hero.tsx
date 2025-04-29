import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="navy-light text-white py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              AI-Powered Support for <span className="text-gold">Veterans' Claims</span>
            </h1>
            <p className="text-lg mb-6">
              Streamline your VA claims process with Valor Assist (Val), your AI navigator through the complexities of veterans' benefits.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="#get-started">
                <Button className="text-center w-full sm:w-auto px-6 py-3 text-navy font-medium gold hover:bg-gold-light">
                  Get Started
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" className="text-center w-full sm:w-auto px-6 py-3 text-white font-medium border border-white hover:bg-white hover:text-navy">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <div className="relative">
              <div className="absolute inset-0 bg-[hsl(var(--secondary))] opacity-20 rounded-lg transform rotate-3"></div>
              <img 
                src="https://images.unsplash.com/photo-1592994118856-4d9cb9d937d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Veteran accessing services on digital device" 
                className="relative rounded-lg shadow-lg z-10"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="navy p-6 rounded-lg shadow-sharp text-center">
            <p className="text-4xl font-bold text-gold mb-2">95%</p>
            <p className="text-sm uppercase tracking-wide">Claim Approval Rate</p>
          </div>
          <div className="navy p-6 rounded-lg shadow-sharp text-center">
            <p className="text-4xl font-bold text-gold mb-2">60%</p>
            <p className="text-sm uppercase tracking-wide">Faster Processing</p>
          </div>
          <div className="navy p-6 rounded-lg shadow-sharp text-center">
            <p className="text-4xl font-bold text-gold mb-2">1000+</p>
            <p className="text-sm uppercase tracking-wide">Veterans Assisted</p>
          </div>
        </div>
      </div>
    </section>
  );
}
