import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { MapPreviewSection } from "./map-preview-section";
import { TestimonialsSection } from "./testimonials-section";
import { Footer } from "./footer";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <MapPreviewSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
}

LandingPage.displayName = "LandingPage";
