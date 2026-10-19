import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import QuickStartSection from '@/components/landing/QuickStartSection';
import BlueprintPreviewSection from '@/components/landing/BlueprintPreviewSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ExpressAuditSection from '@/components/landing/ExpressAuditSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import PricingSection from '@/components/landing/PricingSection';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  // The landing page is designed light: clear the persisted dark-mode class while viewing it.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-background font-elegant antialiased">
      <LandingNav />
      <main>
        <LandingHero />
        <QuickStartSection />
        <FeaturesSection />
        <ExpressAuditSection />
        <BlueprintPreviewSection />
        <BenefitsSection />
        <LandingCTA />
        <PricingSection />
      </main>
      <LandingFooter />
    </div>
  );
}