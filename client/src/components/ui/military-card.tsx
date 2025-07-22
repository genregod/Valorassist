import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MilitaryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  learnMoreLink: string;
}

export function MilitaryCard({ icon: Icon, title, description, features, learnMoreLink }: MilitaryCardProps) {
  return (
    <Card className="h-full hover:shadow-sharp transition-shadow duration-300 military-border bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center mb-2">
          <Icon className="h-8 w-8 text-gold mr-3" />
          <CardTitle className="text-lg font-semibold text-navy">
            {title}
          </CardTitle>
        </div>
        <CardDescription className="text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 text-sm text-slate-700">
          {features.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
        <a
          href={learnMoreLink}
          className="inline-block mt-4 text-sm font-medium underline underline-offset-4 text-blue-600"
        >
          Learn More
        </a>
      </CardContent>
    </Card>
  );
}