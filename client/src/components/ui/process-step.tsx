// client/src/components/ui/process-step.tsx
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ProcessStepProps {
  stepNumber: number;
  title: string;
  description: string;
  // The testimonial prop is now optional
  testimonial?: {
    quote: string;
    author: string;
    service: string;
  };
  icon: LucideIcon;
  reversed?: boolean;
}

export function ProcessStep({
  stepNumber,
  title,
  description,
  testimonial, // testimonial can now be undefined
  icon: Icon,
  reversed = false,
}: ProcessStepProps) {
  return (
    <div className="relative">
      <div className="hidden md:block absolute left-1/2 top-6 w-8 h-8 rounded-full navy border-4 border-[hsl(var(--secondary))] transform -translate-x-1/2"></div>
      <div className="flex flex-col md:flex-row md:items-center">
        <div
          className={`md:w-1/2 ${
            reversed ? "md:pr-16 md:text-right order-2 md:order-1" : "md:pl-16 order-2"
          }`}
        >
          <h3 className="text-xl font-bold text-royal-blue mb-2">{title}</h3>
          <p className="text-slate-600 mb-4">{description}</p>

          {/* This block will now only render if a testimonial is provided */}
          {testimonial && (
            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-sm inline-block">
              <p className="text-sm italic">"{testimonial.quote}"</p>
              <p className="text-sm font-medium mt-2 text-royal-blue">
                — {testimonial.author}, {testimonial.service}
              </p>
            </div>
          )}
        </div>
        <div
          className={`md:w-1/2 ${
            reversed ? "order-1 md:order-2 mb-6 md:mb-0" : "order-1 mb-6 md:mb-0"
          }`}
        >
          <div
            className={`bg-royal-blue/95 backdrop-blur-sm p-6 rounded-lg shadow-sharp military-border ${
              reversed ? "ml-0 md:ml-16" : "mr-0 md:mr-16"
            }`}
          >
            <div className="flex items-center justify-center">
              <Icon className="h-16 w-16 text-white opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}