import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TestimonialProps {
  initials: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

function TestimonialCard({ initials, name, role, quote, rating }: TestimonialProps) {
  return (
    <Card variant="default" className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
          {initials}
        </div>
        <div>
          <h4 className="font-semibold text-dark">{name}</h4>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm md:text-base mb-4 leading-relaxed">{quote}</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
          />
        ))}
      </div>
    </Card>
  );
}

TestimonialCard.displayName = "TestimonialCard";

export function TestimonialsSection() {
  const testimonials: TestimonialProps[] = [
    {
      initials: "JM",
      name: "Jane Martinez",
      role: "E-commerce Owner",
      quote: "KoiExpress transformed our delivery operations. Real-time tracking and reliable drivers mean happy customers.",
      rating: 5,
    },
    {
      initials: "DK",
      name: "David Kim",
      role: "Operations Manager",
      quote: "The multi-carrier support saves us hours every week. We finally have one platform for all our shipping needs.",
      rating: 5,
    },
    {
      initials: "SR",
      name: "Sarah Reynolds",
      role: "Small Business Owner",
      quote: "Professional drivers with proof-of-delivery and passenger protection. It is what we have been waiting for.",
      rating: 4,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dark">Trusted by Thousands</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what our customers and partners say about their experience with KoiExpress.
          </p>
        </div>
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

TestimonialsSection.displayName = "TestimonialsSection";
