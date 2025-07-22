
import { Shield, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-gold to-yellow-400 p-3 rounded-lg shadow-lg">
                <Shield className="h-8 w-8 text-navy" />
              </div>
              <div>
                <h3 className="text-3xl font-bold">ValorAssist</h3>
                <p className="text-gold font-semibold">Veteran Claims Support</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-md font-medium">
              Dedicated to helping veterans secure the benefits they've earned through their service. 
              Veteran-owned and operated with a mission to serve those who served.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-gold/20 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-gold" />
                </div>
                <span className="font-semibold">1-800-VETERAN</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-gold/20 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-gold" />
                </div>
                <span className="font-semibold">info@valorassist.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-gold/20 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-gold" />
                </div>
                <span className="font-semibold">Nationwide Service</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gold">Our Services</h4>
            <nav className="space-y-3">
              <a href="#initial-claims" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Initial Claims
              </a>
              <a href="#appeals" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Appeals & Reviews
              </a>
              <a href="#medical-evidence" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Medical Evidence
              </a>
              <a href="#increase-ratings" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Rating Increases
              </a>
              <a href="#housing" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Housing Benefits
              </a>
              <a href="#education" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Education Benefits
              </a>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gold">Resources</h4>
            <nav className="space-y-3">
              <a href="#" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                VA Benefits Guide
              </a>
              <a href="#" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Disability Calculator
              </a>
              <a href="#" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Claims Checklist
              </a>
              <a href="#" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Success Stories
              </a>
              <a href="#" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                FAQ
              </a>
              <a href="#" className="block text-gray-300 hover:text-gold transition-colors font-medium">
                Contact Support
              </a>
            </nav>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="py-8 border-t border-gold/20">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gold">A+</div>
              <div className="text-sm text-gray-400">BBB Accredited</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gold">VA</div>
              <div className="text-sm text-gray-400">Accredited Agents</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gold">5★</div>
              <div className="text-sm text-gray-400">Google Reviews</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gold">100%</div>
              <div className="text-sm text-gray-400">Veteran Owned</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gold/20 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400 font-medium">
            © 2024 ValorAssist. All rights reserved. | Proudly serving veterans nationwide.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400 font-medium">
            <a href="#" className="hover:text-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gold transition-colors">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
