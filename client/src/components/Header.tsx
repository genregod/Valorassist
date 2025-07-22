import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-navy border-b-4 border-gold sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-gold to-yellow-400 p-2 rounded-lg shadow-lg">
              <Shield className="h-8 w-8 text-navy" />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold tracking-tight">ValorAssist</h1>
              <p className="text-xs text-gold font-medium">Veteran Claims Support</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-white hover:text-gold transition-colors font-semibold">
              Services
            </a>
            <a href="#how-it-works" className="text-white hover:text-gold transition-colors font-semibold">
              Process
            </a>
            <a href="#testimonials" className="text-white hover:text-gold transition-colors font-semibold">
              Testimonials
            </a>
            <Button className="bg-gold text-navy hover:bg-yellow-400 font-bold px-6 py-2 shadow-lg transform hover:scale-105 transition-all">
              GET STARTED
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-navy-light border-t border-gold/30 py-4">
            <nav className="flex flex-col space-y-4">
              <a href="#services" className="text-white hover:text-gold transition-colors font-semibold px-4">
                Services
              </a>
              <a href="#how-it-works" className="text-white hover:text-gold transition-colors font-semibold px-4">
                Process
              </a>
              <a href="#testimonials" className="text-white hover:text-gold transition-colors font-semibold px-4">
                Testimonials
              </a>
              <div className="px-4">
                <Button className="bg-gold text-navy hover:bg-yellow-400 font-bold w-full shadow-lg">
                  GET STARTED
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}