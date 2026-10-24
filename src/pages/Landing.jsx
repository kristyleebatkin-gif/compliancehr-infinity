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
    <div className="relative min-h-screen overflow-hidden bg-white font-elegant antialiased">
      {/* Original published pastel wash spread across the landing page */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-100/70 via-rose-50/60 to-cyan-100/70" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[12%] h-96 w-96 rounded-full bg-fuchsia-200/45 blur-3xl" />
        <div className="absolute right-[-8%] top-[32%] h-96 w-96 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute left-[18%] top-[54%] h-80 w-80 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="absolute right-[12%] top-[74%] h-96 w-96 rounded-full bg-violet-200/45 blur-3xl" />
        <div className="absolute left-[-6%] top-[90%] h-80 w-80 rounded-full bg-rose-200/45 blur-3xl" />
      </div>

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