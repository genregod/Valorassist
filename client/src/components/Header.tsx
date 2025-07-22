// client/src/components/Header.tsx
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/azure-deployment", label: "Deploy" },
];

// The "export" keyword was likely missing from the line below.
export function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <img
            alt="Valor Assist Logo"
            className="h-8 w-8""text-3xl font-bold tracking-tighter md:text-4xl/tight text-gold">
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
              No credit card required."text-3xl font-bold tracking-tighter md:text-4xl/tight text-gold">
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

            src="https://placehold.co/32x32/navy/gold?text=VA"
          />
          <span className="font-bold text-lg">Valor Assist</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground""text-3xl font-bold tracking-tighter md:text-4xl/tight text-gold">
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

            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline">Sign In</Button>
          <Button>Get Started</Button>
        </div>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 p-6">
                <Link href="/" className="flex items-center gap-2 font-bold">
                  <img
                    alt="Valor Assist Logo"
                    className="h-8 w-8"
                    src="https://placehold.co/32x32/navy/gold?text=VA"
                  />
                  <span>Valor Assist</span>
                </Link>
                <nav className="grid gap-2">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex w-full items-center py-2 text-lg font-semibold"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="flex flex-col gap-2">
                  <Button variant="outline">Sign In</Button>
                  <Button>Get Started</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}