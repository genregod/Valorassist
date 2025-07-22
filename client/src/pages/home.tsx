
import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { Demo } from "@/components/Demo";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { ChatWindow } from "@/components/ChatWindow";
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
      <Button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 z-40 bg-navy-700 hover:bg-navy-800 text-white shadow-lg p-4 rounded-full"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      {/* Chat Window */}
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
