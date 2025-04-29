import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import Demo from "@/components/Demo";
import ClaimForm from "@/components/ClaimForm";
import Testimonials from "@/components/Testimonials";
import Partners from "@/components/Partners";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <Demo />
        <ClaimForm />
        <Testimonials />
        <Partners />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
