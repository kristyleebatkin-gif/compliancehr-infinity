import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import MarketingSafeShowcase from '@/components/landing/MarketingSafeShowcase';
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
    <div className="relative min-h-screen overflow-hidden font-elegant antialiased">
      {/* Pastel wash spread across the entire landing page */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-100/80 via-rose-50 to-cyan-100/80" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[16%] h-96 w-96 rounded-full bg-fuchsia-200/50 blur-3xl" />
        <div className="absolute right-[-8%] top-[36%] h-96 w-96 rounded-full bg-amber-100/70 blur-3xl" />
        <div className="absolute left-[18%] top-[58%] h-80 w-80 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="absolute right-[12%] top-[78%] h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
        <div className="absolute left-[-6%] top-[92%] h-80 w-80 rounded-full bg-rose-200/50 blur-3xl" />
      </div>
      <LandingNav />
      <main>
        <MarketingSafeShowcase />
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