
import { MilitaryCard } from "@/components/ui/military-card";
import { FileText, Gavel, GraduationCap, Home, ClipboardList, Stethoscope } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: ClipboardList,
      title: "Initial Claims",
      description: "Complete support for filing your first VA disability claim with maximum impact.",
      features: [
        "Comprehensive C&P exam preparation",
        "Complete medical record analysis",
        "Evidence-based claim strategy",
        "Expert form completion & submission"
      ],
      learnMoreLink: "#initial-claims"
    },
    {
      icon: Gavel,
      title: "Appeals & Reviews", 
      description: "Fight denied claims with our proven appeal strategies and legal expertise.",
      features: [
        "Higher-Level Review preparation",
        "Board of Veterans' Appeals representation",
        "New evidence development & submission",
        "Court of Appeals for Veterans Claims"
      ],
      learnMoreLink: "#appeals"
    },
    {
      icon: Stethoscope,
      title: "Medical Evidence",
      description: "Professional medical evidence gathering and nexus letter preparation.",
      features: [
        "Independent medical examinations",
        "Nexus letter coordination",
        "Medical record organization",
        "Expert medical testimony"
      ],
      learnMoreLink: "#medical-evidence"
    },
    {
      icon: FileText,
      title: "Increase Ratings",
      description: "Maximize your disability rating with thorough reassessment strategies.",
      features: [
        "Rating increase evaluation",
        "Worsened condition documentation",
        "Secondary condition claims",
        "Individual Unemployability pursuit"
      ],
      learnMoreLink: "#increase-ratings"
    },
    {
      icon: Home,
      title: "Housing Benefits",
      description: "Access VA home loans and adaptive housing grants for disabled veterans.",
      features: [
        "VA home loan certification",
        "Specially Adapted Housing grants",
        "Special Housing Adaptation grants",
        "Temporary Residence Adaptation"
      ],
      learnMoreLink: "#housing"
    },
    {
      icon: GraduationCap,
      title: "Education Benefits",
      description: "Navigate GI Bill benefits and vocational rehabilitation programs effectively.",
      features: [
        "GI Bill benefit optimization",
        "Vocational Rehabilitation & Employment",
        "Dependents' education benefits",
        "Yellow Ribbon Program guidance"
      ],
      learnMoreLink: "#education"
    }
  ];

  return (
    <section id="services" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-navy/10 border border-navy/20 rounded-full px-6 py-2 mb-6">
            <span className="text-navy font-bold text-sm">OUR MISSION</span>
          </div>
          <h2 className="text-5xl font-black text-navy mb-6 leading-tight">
            Complete VA Claims
            <span className="text-gold block">Support Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            From initial filings to complex appeals, we provide comprehensive support 
            for every aspect of your VA claims journey.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <MilitaryCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              features={service.features}
              learnMoreLink={service.learnMoreLink}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 bg-gradient-to-r from-navy to-navy-light rounded-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Get the Benefits You've Earned?
          </h3>
          <p className="text-lg mb-8 text-gold">
            Don't leave money on the table. Let our experts maximize your VA benefits.
          </p>
          <button className="bg-gradient-to-r from-gold to-yellow-400 text-navy font-black text-lg px-12 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300">
            START YOUR CLAIM TODAY
          </button>
        </div>
      </div>
    </section>
  );
}
