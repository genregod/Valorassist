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