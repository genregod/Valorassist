import { ProcessStep } from "@/components/ui/process-step";
import { FileUp, Brain, FileSignature, Send, ListChecks } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: FileUp,
      title: "Document Upload & Analysis",
      description: "Securely upload your military and medical documents. Our AI system analyzes them to identify potential claims and supporting evidence.",
      testimonial: {
        quote: "Val quickly analyzed all my service records and found evidence for claims I hadn't even considered.",
        author: "Michael R.",
        service: "Army Veteran"
      },
      reversed: true
    },
    {
      icon: Brain,
      title: "AI-Powered Assessment",
      description: "Val evaluates your documentation against current VA regulations and case precedents to determine the strongest claim strategy.",
      testimonial: {
        quote: "The assessment was incredibly thorough. Val found connections between my conditions and service that I never realized existed.",
        author: "Jennifer T.",
        service: "Navy Veteran"
      },
      reversed: false
    },
    {
      icon: FileSignature,
      title: "Document Preparation",
      description: "Based on the assessment, Val prepares all necessary forms and documentation for your claim, ensuring everything is properly formatted and complete.",
      testimonial: {
        quote: "The documents Val prepared were flawless. Everything was formatted exactly as the VA required, which saved me countless hours.",
        author: "Robert D.",
        service: "Marine Corps Veteran"
      },
      reversed: true
    },
    {
      icon: Send,
      title: "Review & Submission",
      description: "You review the prepared claim package and, with Val's guidance, submit it to the VA. Our system provides clear instructions for every step of the submission process.",
      testimonial: {
        quote: "The review process was simple, and Val guided me through each step of submission. I felt confident knowing everything was done right.",
        author: "Sarah M.",
        service: "Air Force Veteran"
      },
      reversed: false
    },
    {
      icon: ListChecks,
      title: "Claim Tracking & Updates",
      description: "Track your claim's progress through Val's dashboard and receive real-time updates. Our system interprets VA status updates and explains them in clear language.",
      testimonial: {
        quote: "Being able to track my claim and get updates in plain English made a huge difference. For once, I actually understood what was happening with my claim.",
        author: "David P.",
        service: "Army Veteran"
      },
      reversed: true
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered process makes VA claims simple, efficient, and effective.
          </p>
        </div>

        <div className="relative">
          {/* Process Steps Vertical Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-[hsl(47,100%,75%)] transform -translate-x-1/2"></div>
          
          <div className="space-y-16">
            {steps.map((step, index) => (
              <ProcessStep
                key={index}
                stepNumber={index + 1}
                title={step.title}
                description={step.description}
                testimonial={step.testimonial}
                icon={step.icon}
                reversed={step.reversed}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
