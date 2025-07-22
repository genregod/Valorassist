// client/src/components/Demo.tsx
import { Button } from "@/components/ui/button";

// The "export" keyword was likely missing here.
export function Demo() {
  return (
    <section id="demo" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            See Valor Assist in Action
          </h2>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Watch a short video demonstrating how our AI-powered platform can
            transform your VA claim experience.
          </p>
        </div>
        <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden border">
          <img
            src="https://placehold.co/1280x720/navy/gold?text=Valor+Assist+Demo+Video"
            alt="Demo Video Thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Button variant="secondary" size="lg" className="text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-6 w-6"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Play Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}