import React, { useEffect } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import MarketingSafeShowcase from '@/components/landing/MarketingSafeShowcase';
import QuickStartSection from '@/components/landing/QuickStartSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ExpressAuditSection from '@/components/landing/ExpressAuditSection';
import BlueprintPreviewSection from '@/components/landing/BlueprintPreviewSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import PricingSection from '@/components/landing/PricingSection';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';

export default function Landing() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="app-readable relative min-h-screen overflow-hidden bg-white font-elegant text-[#0A2B6D] antialiased">
      {/* Original Published Top Navigation merged with Current Showcase Links */}
      <LandingNav />

      <main className="relative z-10 space-y-6">
        {/* Original Published Hero (Logo, Slogan, Developer Card, 45-Module Strip, Stats & 3 Pillars) */}
        <LandingHero />

        {/* Current Design Showcase (Sales Hero Ribbon, 1-Click Operations, Infinity Core Engine, Health Intelligence, Interactive Executive Office & Profile Wall Scene, Must-Have Review & 45-Screen 2026 Audit) */}
        <MarketingSafeShowcase embedded />

        {/* Original Published 4-Step Quick Start Guide */}
        <QuickStartSection />

        {/* Original Published 12 Core Platform Capabilities */}
        <FeaturesSection />

        {/* Original Published 2-Minute Express Audit Section */}
        <ExpressAuditSection />

        {/* Original Published 45-Module Platform Blueprint & Data Flow Map */}
        <BlueprintPreviewSection />

        {/* Original Published 6 Provider Benefits */}
        <BenefitsSection />

        {/* Merged Current & Original Smart Enhanced All-In-One Pricing & Compliance Document Packages */}
        <PricingSection />

        {/* Original Published Call-To-Action */}
        <LandingCTA />
      </main>

      {/* Original Published Multi-Column Footer with Full Brand & Developer Details */}
      <LandingFooter />
    </div>
  );
}