
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
      <div
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "70px",
          height: "70px",
          backgroundColor: "#001c3d",
          color: "white",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          transition: "transform 0.2s ease-in-out"
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <MessageCircle size={28} color="white" />
      </div>
      
      {/* Chat Window */}
      {isChatOpen && <SimpleChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}
