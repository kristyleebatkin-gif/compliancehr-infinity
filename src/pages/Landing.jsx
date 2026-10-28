import React, { useEffect, useState } from 'react';
import './landing-layout.css';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import UniversalUserSuccessEvidenceFirstSuite from '@/components/operations/UniversalUserSuccessEvidenceFirstSuite';
import UniversalRegisterManagementHubSuite from '@/components/operations/UniversalRegisterManagementHubSuite';
import LandingProductShowcase from '@/components/landing/LandingProductShowcase';
import LandingSolutionSection from '@/components/landing/LandingSolutionSection';
import LandingStatsSection from '@/components/landing/LandingStatsSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingTestimonialsSection from '@/components/landing/LandingTestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import BlueprintPreviewSection from '@/components/landing/BlueprintPreviewSection';
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
    <div className="landing-page relative min-h-screen overflow-x-hidden bg-white font-elegant text-[#0A2B6D] antialiased">
      {/* Top Enterprise SaaS Navigation */}
      <LandingNav onBookDemo={openDemoModal} />

      <main className="landing-main relative z-10 mx-auto w-full max-w-[1440px] bg-white px-4 py-6 sm:px-6 lg:px-8 space-y-10 pb-14">
        {/* 1. Hero Section (Landscape) */}
        <LandingHero onBookDemo={openDemoModal} />

        {/* Top-Level Platform Rule: Universal User Success, Rapid Access & Evidence-First Standard */}
        <UniversalUserSuccessEvidenceFirstSuite />

        {/* Universal Register Management, Record Indexing, Register Health & Document Hub Standard */}
        <UniversalRegisterManagementHubSuite />

        {/* 2. Dashboard Showcase Section (Landscape) */}
        <LandingProductShowcase />

        {/* 3. Feature Pillars Section (Landscape) */}
        <LandingSolutionSection />

        {/* 4. Statistics Section (Landscape) */}
        <LandingStatsSection />

        {/* 5. Why Choose Us Section (Landscape) */}
        <BenefitsSection />

        {/* 6. How It Works Section (Landscape) */}
        <LandingHowItWorks />

        {/* 7. Testimonials Section (Landscape) */}
        <LandingTestimonialsSection />

        {/* 8. Pricing Section (Landscape — Exact Existing Pricing Preserved) */}
        <PricingSection onContactSales={openDemoModal} />

        {/* 9. Module Explorer Section (Landscape — 46 Connected Modules Architecture Map) */}
        <BlueprintPreviewSection />

        {/* FAQ Section */}
        <LandingFaqSection />

        {/* 10. Final CTA Section (Landscape) */}
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