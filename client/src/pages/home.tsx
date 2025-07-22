
import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Demo } from "@/components/Demo";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { SimpleChatWindow } from "@/components/SimpleChatWindow";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function HomePage() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Hero />
        <Services />
        <HowItWorks />
        <Testimonials />
        <Demo />
        <CTA />
      </main>
      
      {/* Chat Support Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 bg-navy-700 hover:bg-navy-800 text-white shadow-2xl rounded-full transition-all hover:scale-110 p-4"
        style={{ 
          width: "70px", 
          height: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
        type="button"
      >
        <MessageCircle size={28} />
        <span className="sr-only">Open chat support</span>
      </button>
      
      {/* Chat Window */}
      {isChatOpen && <SimpleChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}
