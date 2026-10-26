import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import ModuleChipStrip from '@/components/landing/ModuleChipStrip';
import QuickStartSection from '@/components/landing/QuickStartSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ExpressAuditSection from '@/components/landing/ExpressAuditSection';
import BlueprintPreviewSection from '@/components/landing/BlueprintPreviewSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import MarketingSafeShowcase from '@/components/landing/MarketingSafeShowcase';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="app-readable relative min-h-screen overflow-hidden bg-white font-elegant text-[#0A2B6D] antialiased">
      {/* Top Navigation — Top Section Template + Highlights & Features + Quick App Bar */}
      <LandingNav />

      <main className="relative z-10 w-full bg-white px-[0.5cm] py-2 space-y-4 pb-8">
        {/* 1. Hero — Compliance Management, Simplified End to End */}
        <LandingHero />

        <div className="w-full space-y-4">
          {/* 2. Live iPads — Moved Underneath Compliance Simplified */}
          <ModuleChipStrip />

          {/* 3. Our Quick 4 Step Start Guide */}
          <QuickStartSection />

          {/* 4. An Impossible Standard, Achieved Effortlessly */}
          <FeaturesSection />

          {/* 5. From First Question to Audit-Ready Report in Two Minutes (Express Audit) */}
          <ExpressAuditSection />

          {/* 6. Accurate Map of the App */}
          <BlueprintPreviewSection />

          {/* 7. Why Providers Choose ComplianceHR */}
          <BenefitsSection />

          {/* 8. All Marketing & Sales Materials */}
          <MarketingSafeShowcase embedded />

          {/* 9. Final Call-To-Action */}
          <LandingCTA />
        </div>
      </main>

      {/* Multi-Column Footer */}
      <LandingFooter />
    </div>
  );
}