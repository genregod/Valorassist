import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="navy-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-gold text-2xl mr-2">
                <Shield className="h-6 w-6" />
              </span>
              <span className="font-bold text-lg">Valor Assist</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI-powered support for veterans navigating the VA benefits system.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gold transition duration-150">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition duration-150">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition duration-150">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition duration-150">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition duration-150">Home</Link></li>
              <li><Link href="#services" className="text-gray-400 hover:text-white transition duration-150">Services</Link></li>
              <li><Link href="#how-it-works" className="text-gray-400 hover:text-white transition duration-150">How It Works</Link></li>
              <li><Link href="#resources" className="text-gray-400 hover:text-white transition duration-150">Resources</Link></li>
              <li><Link href="#about" className="text-gray-400 hover:text-white transition duration-150">About Us</Link></li>
              <li><Link href="#contact" className="text-gray-400 hover:text-white transition duration-150">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition duration-150">VA Claim Guide</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition duration-150">Benefits Calculator</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition duration-150">Knowledge Base</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition duration-150">Blog</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition duration-150">FAQs</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition duration-150">Support Center</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-gold"></i>
                <span className="text-gray-400">123 Veterans Way, Arlington, VA 22209</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-3 text-gold"></i>
                <span className="text-gray-400">(800) VALOR-AI (825-6724)</span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-3 text-gold"></i>
                <span className="text-gray-400">support@valorassist.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-gray-500 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Valor Assist. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-gray-300 transition duration-150">Privacy Policy</Link>
              <Link href="#" className="hover:text-gray-300 transition duration-150">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-300 transition duration-150">Accessibility</Link>
            </div>
          </div>
          <p className="mt-4 text-xs">
            Valor Assist is not affiliated with the U.S. Department of Veterans Affairs or any government agency. 
            While we strive to provide accurate and up-to-date information, we cannot guarantee specific outcomes for individual claims.
          </p>
        </div>
      </div>
    </footer>
  );
}
