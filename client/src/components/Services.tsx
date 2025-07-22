import { MilitaryCard } from "@/components/ui/military-card";
import { FileText, Gavel, GraduationCap, Home, ClipboardList, Stethoscope } from "lucide-react";

export function Services() {
  const services = [
    {
      icon: FileText,
      title: "VA Claims Preparation",
      description: "Automate the preparation of Fully Developed Claims (FDCs) with AI-powered document analysis and generation.",
      features: [
        "Document analysis & organization",
        "Evidence identification",
        "Forms completion & submission"
      ],
      learnMoreLink: "#claims-details"
    },
    {
      icon: Gavel,
      title: "Appeals Assistance",
      description: "Navigate the complex appeals process with AI-guided support and strategic recommendations.",
      features: [
        "Appeal strategy development",
        "Evidence gap analysis",
        "Supplemental claim support"
      ],
      learnMoreLink: "#appeals-details"
    },
    {
      icon: GraduationCap,
      title: "Education Benefits",
      description: "Maximize your GI Bill and education benefits with personalized guidance and application support.",
      features: [
        "Benefit eligibility assessment",
        "Application preparation",
        "Education program matching"
      ],
      learnMoreLink: "#education-details"
    },
    {
      icon: Home,
      title: "Home Loan Support",
      description: "Simplify the VA home loan process with guided application assistance and eligibility verification.",
      features: [
        "Certificate of Eligibility assistance",
        "Document preparation",
        "Lender connection"
      ],
      learnMoreLink: "#loan-details"
    },
    {
      icon: ClipboardList,
      title: "Discharge Upgrades",
      description: "Navigate the process of upgrading your discharge status with expert AI-powered guidance.",
      features: [
        "Case evaluation",
        "Documentation preparation",
        "Board submission guidance"
      ],
      learnMoreLink: "#discharge-details"
    },
    {
      icon: Stethoscope,
      title: "Healthcare Navigation",
      description: "Get assistance with VA healthcare enrollment, benefits, and appointment scheduling.",
      features: [
        "Healthcare eligibility assessment",
        "Enrollment assistance",
        "Benefits explanation"
      ],
      learnMoreLink: "#healthcare-details"
    }
  ];

  return (
    <section id="services" className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Our Services</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Valor Assist provides comprehensive AI-powered support for all your VA benefit needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </div>
    </section>
  );
}
