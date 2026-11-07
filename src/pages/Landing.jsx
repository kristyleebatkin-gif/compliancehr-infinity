import React, { useEffect, useState } from 'react';
import './landing-layout.css';
import LandingNav from '@/components/landing/LandingNav';
import LandingLaunchVideosSection from '@/components/landing/LandingLaunchVideosSection';
import LandingHero from '@/components/landing/LandingHero';
import RemoteAccessStatusCard from '@/components/landing/RemoteAccessStatusCard';
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
import EnterpriseTopTrustRibbon from '@/components/landing/EnterpriseTopTrustRibbon';
import EnterpriseBelowFooterSuite from '@/components/landing/EnterpriseBelowFooterSuite';
import FloatingQuickActionBar from '@/components/landing/FloatingQuickActionBar';
import DemoBookingModal from '@/components/landing/DemoBookingModal';
import ObsidianSidebarRemote from '@/components/ObsidianSidebarRemote';
import QuickAppBar from '@/components/QuickAppBar';
import Dashboard from '@/pages/Dashboard';

export default function Landing() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoTopic, setDemoTopic] = useState('Executive Platform Demo');
  const [remoteDrawerOpen, setRemoteDrawerOpen] = useState(false);
  const [showLiveDashboard, setShowLiveDashboard] = useState(true);

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
      {/* Docked Navigator Router Remote on Screen */}
      <aside
        aria-label="Navigator Router Remote"
        className="hidden md:flex w-64 shrink-0 flex-col bg-white sticky top-0 h-dvh z-40"
        style={{
          borderRight: '3px solid transparent',
          backgroundImage:
            'linear-gradient(#ffffff, #ffffff), linear-gradient(180deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box',
        }}
      >
        <ObsidianSidebarRemote />
      </aside>

      {/* Mobile Drawer for Navigator Remote on small screens */}
      {remoteDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setRemoteDrawerOpen(false)}
          />
          <aside className="relative h-full w-64 bg-white shadow-2xl">
            <ObsidianSidebarRemote />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Enterprise SaaS Navigation — flush with Navigator Remote */}
        <LandingNav
          onBookDemo={openDemoModal}
          showLiveDashboard={showLiveDashboard}
          onToggleLiveDashboard={() => setShowLiveDashboard((v) => !v)}
        />

        <main className="landing-main relative z-10 mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 pb-20">

        {/* 1. Hero Section (Landscape — Crystal-Clear Positioning Above the Fold) */}
        <LandingHero onBookDemo={openDemoModal} />

        {/* Live Remote Access & VPN Security Status Card */}
        <RemoteAccessStatusCard />

        {/* 2. Launch Story Videos: Video 1 (Kristy's Story) + "See ComplianceHR Infinity in action" Video 2 */}
        <LandingLaunchVideosSection />

        {/* Evidence-First Operating Standard */}
        <LandingEvidenceStandardSection />

        {/* Universal Register Engine Standard */}
        <LandingRegisterEngineSection />

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

        {/* Below-Footer Sovereign Security, Regulatory Attestation & Module Launch Bar */}
        <EnterpriseBelowFooterSuite onBookDemo={openDemoModal} />

        {/* Floating Bottom-Right Enterprise Quick-Action Bar */}
        <FloatingQuickActionBar
          onBookDemo={openDemoModal}
          onToggleRemote={() => setRemoteDrawerOpen((v) => !v)}
        />

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