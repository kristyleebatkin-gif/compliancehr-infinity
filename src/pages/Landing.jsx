import React, { useEffect, useState } from 'react';
import './landing-layout.css';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingStatsSection from '@/components/landing/LandingStatsSection';
import LandingProblemSection from '@/components/landing/LandingProblemSection';
import LandingSolutionSection from '@/components/landing/LandingSolutionSection';
import LandingProductShowcase from '@/components/landing/LandingProductShowcase';
import BenefitsSection from '@/components/landing/BenefitsSection';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import BlueprintPreviewSection from '@/components/landing/BlueprintPreviewSection';
import LandingTestimonialsSection from '@/components/landing/LandingTestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import LandingFaqSection from '@/components/landing/LandingFaqSection';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';
import DemoBookingModal from '@/components/landing/DemoBookingModal';

export default function Landing() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoTopic, setDemoTopic] = useState('Executive Platform Demo');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const openDemoModal = (topic = 'Executive Platform Demo') => {
    setDemoTopic(topic);
    setDemoModalOpen(true);
  };

  return (
    <div className="landing-page app-readable relative min-h-screen overflow-x-hidden bg-white font-elegant text-[#0A2B6D] antialiased">
      {/* Top Enterprise SaaS Navigation */}
      <LandingNav onBookDemo={openDemoModal} />

      <main className="landing-main relative z-10 mx-auto w-full max-w-[1440px] bg-white px-4 py-6 sm:px-6 lg:px-8 space-y-12 pb-16">
        {/* 1. HERO SECTION */}
        <LandingHero onBookDemo={openDemoModal} />

        {/* 2. STATISTICS SECTION (Animated KPI Cards) */}
        <LandingStatsSection />

        {/* 3. PROBLEM SECTION */}
        <LandingProblemSection />

        {/* 4. SOLUTION SECTION (4 Large Pillar Cards) */}
        <LandingSolutionSection />

        {/* 5. PRODUCT SHOWCASE (Everything Connected) */}
        <LandingProductShowcase />

        {/* 6. WHY CHOOSE COMPLIANCEHR INFINITY (6 Benefit Cards) */}
        <BenefitsSection />

        {/* 7. HOW IT WORKS (Visual 3-Step Workflow) */}
        <LandingHowItWorks />

        {/* 8. PLATFORM EXPLORER (All 46 Modules & Information Flows — Placed Below Main Marketing Content) */}
        <BlueprintPreviewSection />

        {/* 9. TESTIMONIALS (CEO, Operations Manager, Compliance Manager) */}
        <LandingTestimonialsSection />

        {/* 10. PRICING SECTION (Exact Existing Pricing Preserved) */}
        <PricingSection onContactSales={openDemoModal} />

        {/* 11. FAQ SECTION (8 Topics) */}
        <LandingFaqSection />

        {/* 12. FINAL CTA */}
        <LandingCTA onBookDemo={openDemoModal} />
      </main>

      {/* Enterprise Multi-Column Footer */}
      <LandingFooter onBookDemo={openDemoModal} />

      {/* Interactive Demo & Sales Booking Modal */}
      <DemoBookingModal
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialTopic={demoTopic}
      />
    </div>
  );
}