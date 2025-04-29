import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  quote: string;
  name: string;
  position: string;
  image: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote: "Val helped me navigate the complex VA claims process that I had been struggling with for years. The AI system found evidence in my records that I never knew was relevant. My claim was approved in half the time I expected.",
      name: "James W.",
      position: "Army Veteran",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      quote: "After three denied claims, I was ready to give up. Valor Assist analyzed my case, identified the missing evidence, and guided me through resubmitting. My appeal was approved and I finally received the benefits I deserved.",
      name: "Maria R.",
      position: "Navy Veteran",
      image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      quote: "As a VSO, Val has transformed how we assist veterans. We can now help 3x more veterans with the same staff because the AI handles document preparation and evidence analysis. It's revolutionized our operation.",
      name: "Thomas B.",
      position: "VSO Representative",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-4">Veterans We've Helped</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hear directly from veterans who have successfully navigated the VA claims process with Valor Assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-neutral-100 rounded-lg p-6 shadow-sharp relative">
              <div className="absolute -top-5 left-6">
                <span className="text-4xl text-gold">❝</span>
              </div>
              <CardContent className="pt-4 px-0">
                <p className="italic text-muted-foreground mb-6">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="font-medium text-navy">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#success-stories" className="inline-flex items-center text-navy font-medium hover:text-[hsl(220,60%,30%)] transition-colors">
            Read More Success Stories <i className="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
