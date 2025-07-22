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