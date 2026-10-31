import React, { useEffect, useState } from 'react';
import './landing-layout.css';
import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
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
    <div className="landing-page relative min-h-screen overflow-x-hidden bg-slate-50 font-body text-slate-900 antialiased">
      <LandingNav onBookDemo={openDemoModal} />

      <main className="landing-main relative z-10 mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-8 pb-14">
        <LandingHero onBookDemo={openDemoModal} />
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
        <LandingCTA onBookDemo={openDemoModal} />
      </main>

      <LandingFooter onBookDemo={openDemoModal} />

      <DemoBookingModal
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialTopic={demoTopic}
      />
    </div>
  );
}