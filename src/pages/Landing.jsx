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
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-background dark:via-slate-950 dark:to-background">
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