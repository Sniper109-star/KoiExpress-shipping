import { Navigation, Truck, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FeaturesSection() {
  const features = [
    {
      icon: Navigation,
      title: "Real-time Tracking",
      description: "Monitor your shipments with live GPS updates and automatic status notifications at every checkpoint.",
    },
    {
      icon: Truck,
      title: "Multi-Carrier Support",
      description: "Same-day, standard, international, and freight options. We partner with the best carriers globally.",
    },
    {
      icon: ShieldCheck,
      title: "Professional Drivers",
      description: "Vetted drivers with ratings, insurance, and proof-of-delivery. Your packages are in safe hands.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark">Why Choose KoiExpress</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for speed, reliability, and transparency. Here is what sets us apart.
          </p>
        </div>
        <div className="grid gap-8 md:gap-8 grid-cols-1 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} variant="default" className="p-6 md:p-8 text-center hover:shadow-md transition-shadow">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-dark">{feature.title}</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

FeaturesSection.displayName = "FeaturesSection";
