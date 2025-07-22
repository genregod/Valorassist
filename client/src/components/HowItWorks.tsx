// client/src/components/HowItWorks.tsx
import { ProcessStep } from "@/components/ui/process-step";

// The "export" keyword was likely missing here.
export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              A Simplified Path to Your Benefits
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Follow our straightforward, three-step process to build and file
              your VA claim with confidence.
            </p>
          </div>
        </div>
        <div className="mx-auto grid gap-12 pt-12 md:grid-cols-3">
          <ProcessStep
            step="1"
            title="Upload Your Documents"
            description="Securely upload your military and medical records. Our AI will analyze them to find potential claims."
          />
          <ProcessStep
            step="2"
            title="Review & Refine"
            description="Work with our AI assistant, Val, to review the findings, answer clarifying questions, and build your case."
          />
          <ProcessStep
            step="3"
            title="Submit with Confidence"
            description="Generate a complete, well-documented claim package ready for submission to the VA."
          />
        </div>
      </div>
    </section>
  );
}