
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
      
      {/* Test Button */}
      <div 
        style={{
          position: "fixed",
          bottom: "100px",
          right: "20px",
          zIndex: 99999,
          backgroundColor: "red",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
          cursor: "pointer"
        }}
        onClick={() => alert("Test button clicked!")}
      >
        TEST CLICK ME
      </div>
      
      {/* Chat Support Button */}
      <div
        onClick={() => {
          alert("Chat button clicked!");
          setIsChatOpen(!isChatOpen);
        }}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "80px",
          height: "80px",
          backgroundColor: "#1a365d",
          color: "white",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 99999,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}
      >
        <MessageCircle size={32} color="white" />
      </div>
      
      {/* Chat Window */}
      {isChatOpen && <SimpleChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}
