
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
    <Card className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 military-border bg-white border-2 border-gray-100 hover:border-gold/50">
      <CardHeader className="pb-4">
        <div className="flex items-start mb-4">
          <div className="bg-gradient-to-br from-gold to-yellow-500 p-3 rounded-xl mr-4 shadow-lg">
            <Icon className="h-8 w-8 text-navy" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-navy mb-2 leading-tight">
              {title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="text-gray-600 text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-6">
          <ul className="space-y-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start">
                <div className="w-2 h-2 bg-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-sm text-gray-700 font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <a
          href={learnMoreLink}
          className="inline-flex items-center text-navy font-bold text-sm hover:text-gold transition-colors duration-200 group"
        >
          Learn More
          <svg 
            className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </CardContent>
    </Card>
  );
}
