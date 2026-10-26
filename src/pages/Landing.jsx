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
    <div
      className="app-readable relative min-h-screen overflow-hidden font-elegant text-[#0A2B6D] antialiased"
      style={{
        background:
          'linear-gradient(180deg, #E8DEFF 0%, #F5F0FF 25%, #FFE8F6 50%, #E6F4FF 75%, #F5F0FF 100%)',
      }}
    >
      {/* Top Navigation with App-Coloured Background to Page Edges, Longer Brand Name, 6-Per-Line Full-Colour Features & Quick App Bar */}
      <LandingNav />

      <main className="relative z-10 space-y-5 px-2 pb-8 pt-2 sm:px-4">
        {/* 1. Hero (Larger Logo, Redesigned Software Card, Bright Pink Start Guide, 6-Per-Line Full-Colour Modules, 4 Stats & 3 Pillars) */}
        <LandingHero />

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
      </main>

      {/* Multi-Column Footer */}
      <LandingFooter />
    </div>
  );
}