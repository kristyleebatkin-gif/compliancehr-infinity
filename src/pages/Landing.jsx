import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
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
      {/* Top Navigation — Top Section Template + Listed Features & Quick App Bar */}
      <LandingNav />

      <main className="relative z-10 w-full bg-white px-[0.5cm] py-2 space-y-4 pb-8">
        {/* 1. Hero — Styled with Top Section Template */}
        <LandingHero />

        <div className="w-full space-y-4">
          {/* 2. Compliance in 4 Steps (Quick Start Guide) */}
          <QuickStartSection />

          {/* 3. An Impossible Standard, Achieved Effortlessly (12 Core Capabilities — 6 per line in mixed full colours) */}
          <FeaturesSection />

          {/* 4. From First Question to Audit-Ready Report in Two Minutes (Express Audit) */}
          <ExpressAuditSection />

          {/* 5. Accurate Map of the App -> Minimised Colourful Connections & Access Info -> Colourful Live Workspace */}
          <BlueprintPreviewSection />

          {/* 6. Why Providers Choose ComplianceHR */}
          <BenefitsSection />

          {/* 7. All Marketing & Sales Materials Ordered After "Why Providers Choose ComplianceHR" */}
          <MarketingSafeShowcase embedded />

          {/* 8. Final Call-To-Action */}
          <LandingCTA />
        </div>
      </main>

      {/* Multi-Column Footer */}
      <LandingFooter />
    </div>
  );
}