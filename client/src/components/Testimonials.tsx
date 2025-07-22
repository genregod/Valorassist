// client/src/components/Testimonials.tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// The "export" keyword was likely missing here.
export function Testimonials() {
  const testimonials = [
    {
      name: "John D., Army Veteran",
      avatar: "JD",
      text: "Valor Assist turned a process I'd been dreading for years into something manageable. The AI found a connection for my tinnitus I never would have made. My claim was approved in 4 months.",
    },
    {
      name: "Maria G., Air Force",
      avatar: "MG",
      text: "I was overwhelmed with paperwork. Val organized everything and helped me build a claim for my back injury that was clear and undeniable. I can't recommend this service enough.",
    },
    {
      name: "David S., Marine Corps",
      avatar: "DS",
      text: "As someone not great with computers, I found the platform surprisingly easy to use. The step-by-step guidance was a lifesaver. Finally got the rating I deserve.",
    },
  ];

  return (
    <section
      id="testimonials"
      className="w-full py-12 md:py-24 lg:py-32 bg-muted"
    >
      <div className="container px-4 md:px-6">
        <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-5xl mb-12">
          Trusted by Veterans Like You
        </h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex flex-col items-center text-center aspect-square justify-center p-6">
                      <Avatar className="mb-4 h-16 w-16">
                        <AvatarImage
                          src={`https://placehold.co/64x64/navy/gold?text=${testimonial.avatar}`}
                        />
                        <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-muted-foreground mb-2">
                        "{testimonial.text}"
                      </p>
                      <span className="font-semibold">{testimonial.name}</span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}

// ---

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

// ---

// client/src/components/CTA.tsx
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

// The "export" keyword was likely missing here.
export function CTA() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-navy text-white">
      <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-gold">
            Ready to Get the Benefits You Deserve?
          </h2>
          <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Don't let a complex process stand in your way. Start your claim
            with Valor Assist today and take the first step towards a more
            secure future.
          </p>
        </div>
        <div className="mx-auto w-full max-w-sm space-y-2">
          <Button type="submit" size="lg" className="w-full bg-gold text-navy hover:bg-gold/90">
            Start Your Claim for Free
          </Button>
          <p className="text-xs text-gray-400">
            No credit card required.
            <Link href="/privacy" className="underline underline-offset-2 ml-1">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

// ---

// client/src/components/Footer.tsx
import { Link } from "wouter";

// The "export" keyword was likely missing here.
export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-8 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Valor Assist. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          <Link href="/terms" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs hover:underline underline-offset-4">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}


