
import { ProcessStep } from "@/components/ui/process-step";
import { FileSearch, Users, FileText, Trophy } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: FileSearch,
      title: "Free Case Review",
      description: "Our expert team analyzes your service records and medical history to identify all eligible claims.",
      details: [
        "Comprehensive service record analysis",
        "Medical history evaluation", 
        "Benefit eligibility assessment",
        "Custom strategy development"
      ]
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Work directly with VA-accredited representatives and former VA employees who know the system.",
      details: [
        "VA-accredited representation",
        "Former VA employee insights",
        "Personalized claim strategy",
        "Direct expert communication"
      ]
    },
    {
      icon: FileText,
      title: "Complete Documentation",
      description: "We handle all paperwork, evidence gathering, and submission to maximize your claim's success.",
      details: [
        "Professional form completion",
        "Medical evidence coordination",
        "Supporting documentation",
        "Timely submission management"
      ]
    },
    {
      icon: Trophy,
      title: "Maximize Benefits",
      description: "Get the highest possible rating and benefits you've earned through your honorable service.",
      details: [
        "Optimal rating achievement",
        "Backdated compensation",
        "Secondary condition claims",
        "Ongoing support & appeals"
      ]
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-gold/10 border border-gold/20 rounded-full px-6 py-2 mb-6">
            <span className="text-navy font-bold text-sm">OUR PROCESS</span>
          </div>
          <h2 className="text-5xl font-black text-navy mb-6 leading-tight">
            How We Fight
            <span className="text-gold block">For Your Benefits</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Our battle-tested 4-step process ensures maximum success for your VA claims.
            We handle the complexity so you can focus on what matters most.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <ProcessStep
              key={index}
              step={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
              details={step.details}
            />
          ))}
        </div>

        {/* Success Stats */}
        <div className="bg-gradient-to-r from-navy via-navy-light to-navy rounded-3xl p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black mb-4">Proven Results</h3>
            <p className="text-xl text-gold font-semibold">Our track record speaks for itself</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-black text-gold">98%</div>
              <div className="text-lg font-semibold">Success Rate</div>
              <div className="text-sm text-gray-300">Claims Approved</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-gold">$2.4M</div>
              <div className="text-lg font-semibold">Average Award</div>
              <div className="text-sm text-gray-300">Per Veteran</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-gold">90</div>
              <div className="text-lg font-semibold">Days Average</div>
              <div className="text-sm text-gray-300">Processing Time</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-black text-gold">15K+</div>
              <div className="text-lg font-semibold">Veterans Served</div>
              <div className="text-sm text-gray-300">And Growing</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
