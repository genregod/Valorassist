import { useState } from "react";
import { Link } from "wouter";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="navy shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 text-white mr-6">
              <span className="text-gold text-3xl mr-2">
                <Shield className="h-8 w-8" />
              </span>
              <div>
                <span className="font-bold text-xl tracking-tight">Valor Assist</span>
                <span className="block text-xs tracking-widest text-gold">AI-POWERED VETERANS SUPPORT</span>
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="#services" className="text-gray-300 hover:text-white transition duration-150">Services</Link>
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition duration-150">How It Works</Link>
            <Link href="#resources" className="text-gray-300 hover:text-white transition duration-150">Resources</Link>
            <Link href="#about" className="text-gray-300 hover:text-white transition duration-150">About</Link>
            <Link href="#contact" className="text-gray-300 hover:text-white transition duration-150">Contact</Link>
          </nav>
          
          <div className="flex items-center">
            <Link href="#login">
              <Button variant="outline" className="hidden md:inline-block text-sm px-4 py-2 mr-4 text-white border-white hover:border-transparent hover:text-navy hover:bg-[hsl(var(--secondary))]">
                Login
              </Button>
            </Link>
            <Link href="#get-started">
              <Button className="hidden md:inline-block text-sm px-4 py-2 text-navy gold hover:bg-gold-light">
                Get Started
              </Button>
            </Link>
            
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
              onClick={toggleMobileMenu}
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-4 space-y-1">
            <Link href="#services" className="block px-3 py-2 text-base font-medium text-white hover:bg-[hsl(220,60%,30%)] rounded-md">Services</Link>
            <Link href="#how-it-works" className="block px-3 py-2 text-base font-medium text-white hover:bg-[hsl(220,60%,30%)] rounded-md">How It Works</Link>
            <Link href="#resources" className="block px-3 py-2 text-base font-medium text-white hover:bg-[hsl(220,60%,30%)] rounded-md">Resources</Link>
            <Link href="#about" className="block px-3 py-2 text-base font-medium text-white hover:bg-[hsl(220,60%,30%)] rounded-md">About</Link>
            <Link href="#contact" className="block px-3 py-2 text-base font-medium text-white hover:bg-[hsl(220,60%,30%)] rounded-md">Contact</Link>
            <div className="mt-4 flex flex-col space-y-3">
              <Link href="#login" className="text-center px-4 py-2 border rounded text-white border-white hover:border-transparent hover:text-navy hover:bg-[hsl(var(--secondary))] transition duration-150">Login</Link>
              <Link href="#get-started" className="text-center px-4 py-2 rounded text-navy gold hover:bg-gold-light transition duration-150">Get Started</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
