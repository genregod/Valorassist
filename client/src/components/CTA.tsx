import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CTA() {
  return (
    <section className="py-16 navy">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get the Benefits You've Earned?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of veterans who have successfully navigated the VA claims process with Valor Assist.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="#get-started">
              <Button className="w-full sm:w-auto px-8 py-4 gold text-navy font-bold hover:bg-gold-light">
                Get Started Now
              </Button>
            </Link>
            <Link href="#contact">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white font-bold hover:bg-white hover:text-navy">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
