import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles, ShieldCheck, Layers, Award,
  ArrowRight, Calendar, MessageSquare, BarChart3, Zap,
} from 'lucide-react';
import CareSpherePowerBiCommandCentre from '@/components/enterprise/powerbi/CareSpherePowerBiCommandCentre';
import Communications from '@/pages/Communications';
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
import DemoBookingModal from '@/components/landing/DemoBookingModal';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #A855F7 62%, #FF2E9A 100%)';

const EXECUTIVE_TRUST_PILLS = [
  { label: '46 Connected Modules', color: '#00C6FF', icon: Layers },
  { label: '17 Categories · 356 Checkpoints', color: '#0072FF', icon: ShieldCheck },
  { label: '100+ Tailored Business Docs', color: '#A855F7', icon: Sparkles },
  { label: '$160/mo Elite Tokens Included', color: '#FF2E9A', icon: Award },
];

export default function Dashboard() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoTopic, setDemoTopic] = useState('Executive Platform & Subscription Demo');

  const openDemoModal = (topic = 'Executive Platform & Subscription Demo') => {
    setDemoTopic(topic);
    setDemoModalOpen(true);
  };

  return (
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] space-y-5 pb-12">
      {/* 1. FIRST-CLASS EXECUTIVE DASHBOARD & SUBSCRIPTION COMMAND STRIP */}
      <section
        aria-label="Executive Dashboard and Subscription Command Strip"
        className="overflow-hidden rounded-2xl p-[1.5px] shadow-xl"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="rounded-[14px] bg-[#081018] px-4 py-3 text-white space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black"
                style={{
                  border: '1.5px solid #00C6FF',
                  boxShadow: '0 0 12px rgba(0,198,255,0.55)',
                }}
              >
                <LayoutDashboard className="h-4.5 w-4.5 text-[#00C6FF]" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-sm sm:text-base font-black leading-tight tracking-tight text-white">
                    1. Executive Dashboard, Live Communication &amp; Subscription Showcase
                  </h1>
                  <span className="rounded-full border border-[#00C6FF]/50 bg-[#0072FF] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                    14-Day Free Trial Live
                  </span>
                </div>
                <p className="text-[11px] font-semibold leading-snug text-slate-300">
                  Unified Communication &amp; Mailbox Hub, Live Roster &amp; Weather, 12-Page Power BI Command Centre, and Smart Enhanced All-In-One Subscriptions.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <a
                href="#pricing"
                className="inline-flex h-7 items-center gap-1 rounded-full border border-white/25 bg-[#FF2E9A] px-3 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-[0_0_10px_rgba(255,46,154,0.55)] transition hover:opacity-95"
              >
                <Zap className="h-3 w-3 shrink-0 text-white" />
                <span>View Subscriptions ($760–$1,220/mo)</span>
              </a>
              <Link
                to="/register"
                className="inline-flex h-7 items-center gap-1 rounded-full border border-[#00C6FF] bg-[#0072FF] px-3 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-[0_0_10px_rgba(0,114,255,0.5)] transition hover:opacity-95"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="h-3 w-3 shrink-0 text-[#00C6FF]" />
              </Link>
              <button
                type="button"
                onClick={() => openDemoModal('Book Executive Subscription Demo')}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-[#A855F7] bg-black px-3 text-[10px] font-extrabold uppercase tracking-wide text-white transition hover:border-[#00C6FF]"
              >
                <Calendar className="h-3 w-3 shrink-0 text-[#00C6FF]" />
                <span>Book Demo</span>
              </button>
              <a
                href="#live-communication-hub"
                className="inline-flex h-7 items-center gap-1 rounded-full border border-[#00C6FF]/60 bg-black px-2.5 text-[10px] font-extrabold uppercase tracking-wide text-white transition hover:bg-[#0072FF]"
              >
                <MessageSquare className="h-3 w-3 shrink-0 text-[#00C6FF]" />
                <span>Communication Hub</span>
              </a>
              <a
                href="#powerbi-command-centre"
                className="inline-flex h-7 items-center gap-1 rounded-full border border-[#A855F7]/60 bg-black px-2.5 text-[10px] font-extrabold uppercase tracking-wide text-white transition hover:bg-[#5A00D6]"
              >
                <BarChart3 className="h-3 w-3 shrink-0 text-[#A855F7]" />
                <span>Power BI Command</span>
              </a>
            </div>
          </div>

          {/* 4 High-Contrast Subscription & Governance Value Indicators */}
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 pt-0.5">
            {EXECUTIVE_TRUST_PILLS.map((pill) => {
              const Icon = pill.icon;
              return (
                <div
                  key={pill.label}
                  className="flex items-center gap-2 rounded-lg bg-black px-2.5 py-1.5"
                  style={{ border: `1px solid ${pill.color}66` }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: pill.color }} />
                  <span className="truncate text-[10px] font-extrabold text-white">
                    {pill.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. LIVE COMMUNICATION, WEATHER, ROSTER, MAILBOX & TASKS COMMAND HUB */}
      <div id="live-communication-hub" className="scroll-mt-32">
        <Communications embedded={false} />
      </div>

      {/* 3. EXECUTIVE HERO & INTERACTIVE 3-ROW ROLE PREVIEW */}
      <LandingHero onBookDemo={openDemoModal} />

      {/* 4. SMART ENHANCED ALL-IN-ONE ELITE SUBSCRIPTION PACKAGES */}
      <PricingSection onContactSales={openDemoModal} />

      {/* 5. CARESPHERE 12-PAGE POWER BI EXECUTIVE COMMAND CENTRE */}
      <div id="powerbi-command-centre" className="scroll-mt-32">
        <CareSpherePowerBiCommandCentre />
      </div>

      {/* 6. UNIFIED LAUNCH SHOWCASE & FOUNDER STORY VIDEOS */}
      <LandingLaunchVideosSection />

      {/* 7. EVIDENCE-FIRST OPERATING STANDARD & 45 MASTER REGISTERS */}
      <LandingEvidenceStandardSection />
      <LandingRegisterEngineSection />

      {/* 8. PRODUCT SHOWCASE, FEATURE PILLARS, STATS & BENEFITS */}
      <LandingProductShowcase />
      <LandingSolutionSection />
      <LandingStatsSection />
      <BenefitsSection />

      {/* 9. HOW IT WORKS, VERIFIED TESTIMONIALS & 46-MODULE ARCHITECTURE MAP */}
      <LandingHowItWorks />
      <LandingTestimonialsSection />
      <BlueprintPreviewSection />

      {/* 10. EXECUTIVE FAQS, ZERO-TRUST REMOTE ACCESS (2ND FROM BOTTOM) & FINAL CTA */}
      <LandingFaqSection />
      <RemoteAccessStatusCard />
      <LandingCTA onBookDemo={openDemoModal} />

      <DemoBookingModal
        open={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        initialTopic={demoTopic}
      />
    </div>
  );
}