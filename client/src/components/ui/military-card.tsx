import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <Card className="bg-neutral-100 rounded-lg overflow-hidden shadow-sharp transition-transform duration-300 hover:-translate-y-1">
      <div className="h-2 bg-[hsl(var(--secondary))]"></div>
      <CardContent className="p-6">
        <div className="rounded-full navy h-12 w-12 flex items-center justify-center mb-4">
          <Icon className="text-gold text-lg" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">
          {description}
        </p>
        <ul className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <i className="fas fa-check text-green-600 mt-1 mr-2"></i>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <a href={learnMoreLink} className="text-navy font-medium hover:text-navy-light">
          Learn more <i className="fas fa-arrow-right ml-1"></i>
        </a>
      </CardContent>
    </Card>
  );
}
