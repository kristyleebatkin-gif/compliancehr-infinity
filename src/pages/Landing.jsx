import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import QuickStartSection from '@/components/landing/QuickStartSection';
import BlueprintPreviewSection from '@/components/landing/BlueprintPreviewSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import PricingSection from '@/components/landing/PricingSection';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-background font-elegant antialiased">
      <LandingNav />
      <main>
        <LandingHero />
        <QuickStartSection />
        <FeaturesSection />
        <BlueprintPreviewSection />
        <BenefitsSection />
        <LandingCTA />
        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
}