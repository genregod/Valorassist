import { Button } from "@/components/ui/button";
import { Play, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Demo() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="navy rounded-xl overflow-hidden shadow-lg">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 md:pr-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">See Val in Action</h2>
                <p className="text-gray-300 mb-6">
                  Watch how Valor Assist can transform your VA claims experience with AI-powered support.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link href="#demo-video">
                    <Button className="text-center w-full sm:w-auto px-6 py-3 gold text-navy font-medium hover:bg-gold-light">
                      <Play className="h-4 w-4 mr-2" /> Watch Demo
                    </Button>
                  </Link>
                  <Link href="#schedule-demo">
                    <Button variant="outline" className="text-center w-full sm:w-auto px-6 py-3 text-white border-white font-medium hover:bg-white hover:text-navy">
                      <Calendar className="h-4 w-4 mr-2" /> Schedule Live Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                    alt="Valor Assist interface on laptop" 
                    className="w-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="navy bg-opacity-60 rounded-full p-4">
                      <Play className="h-10 w-10 text-gold" />
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
