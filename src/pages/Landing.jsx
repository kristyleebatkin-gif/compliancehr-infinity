import React, { useEffect, useState } from 'react';
import './landing-layout.css';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import EnterpriseBelowFooterSuite from '@/components/landing/EnterpriseBelowFooterSuite';
import DemoBookingModal from '@/components/landing/DemoBookingModal';
import LandingHero from '@/components/landing/LandingHero';
import LandingLaunchVideosSection from '@/components/landing/LandingLaunchVideosSection';
import LandingEvidenceStandardSection from '@/components/landing/LandingEvidenceStandardSection';
import LandingRegisterEngineSection from '@/components/landing/LandingRegisterEngineSection';
import LandingProductShowcase from '@/components/landing/LandingProductShowcase';
import LandingSolutionSection from '@/components/landing/LandingSolutionSection';
import LandingStatsSection from '@/components/landing/LandingStatsSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingTestimonialsSection from '@/components/landing/LandingTestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import BlueprintPreviewSection from '@/components/landing/BlueprintPreviewSection';
import LandingFaqSection from '@/components/landing/LandingFaqSection';
import RemoteAccessStatusCard from '@/components/landing/RemoteAccessStatusCard';
import LandingCTA from '@/components/landing/LandingCTA';

export default function Landing() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoTopic, setDemoTopic] = useState('Executive Platform Demo');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'book') {
      setDemoTopic('Book a Personal Demo');
      setDemoModalOpen(true);
    }
  }, []);

  const openDemoModal = (topic = 'Executive Platform Demo') => {
    setDemoTopic(topic);
    setDemoModalOpen(true);
  };

  return (
    <div className="landing-page relative flex min-h-screen overflow-x-hidden bg-[#F8FAFC] font-elegant text-[#0A2B6D] antialiased">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Enterprise SaaS Navigation — flush with Navigator Remote */}
        <LandingNav onBookDemo={openDemoModal} />

        <main id="landing-content" tabIndex={-1} className="landing-main relative z-10 mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 pb-20">
          <LandingHero onBookDemo={openDemoModal} />
          <LandingLaunchVideosSection />
          <LandingEvidenceStandardSection />
          <LandingRegisterEngineSection />
          <LandingProductShowcase />
          <LandingSolutionSection />
          <LandingStatsSection />
          <BenefitsSection />
          <LandingHowItWorks />
          <LandingTestimonialsSection />
          <PricingSection onContactSales={openDemoModal} />
          <BlueprintPreviewSection />
          <LandingFaqSection />
          <RemoteAccessStatusCard />
          <LandingCTA onBookDemo={openDemoModal} />
        </main>

        {/* Blue Enterprise Technology & Regulatory Attestation Dashboard (Reduced by 25%) */}
        <EnterpriseBelowFooterSuite onBookDemo={openDemoModal} />

        {/* Compact White Architectural Pillars Section Above Final Brand Logo Lockup */}
        <LandingFooter onBookDemo={openDemoModal} />

        {/* Interactive Demo & Sales Booking Modal */}
        <DemoBookingModal
          open={demoModalOpen}
          onClose={() => setDemoModalOpen(false)}
          initialTopic={demoTopic}
        />
      </div>
    </div>
  );
}