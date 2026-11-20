import React, { useEffect, useState } from 'react';
import './landing-layout.css';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import DemoBookingModal from '@/components/landing/DemoBookingModal';
import LandingHero from '@/components/landing/LandingHero';
import LandingSolutionSection from '@/components/landing/LandingSolutionSection';
import PricingSection from '@/components/landing/PricingSection';
import LandingFaqSection from '@/components/landing/LandingFaqSection';
import LandingCTA from '@/components/landing/LandingCTA';

export default function Landing() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoTopic, setDemoTopic] = useState('Platform walkthrough');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'book') {
      setDemoTopic('Tailored platform walkthrough');
      setDemoModalOpen(true);
    }
  }, []);

  const openDemoModal = (topic = 'Platform walkthrough') => {
    setDemoTopic(topic);
    setDemoModalOpen(true);
  };

  return (
    <div className="landing-page relative flex min-h-screen overflow-x-hidden bg-[#F8FAFC] font-elegant text-[#0A2B6D] antialiased">
      <div className="flex min-w-0 flex-1 flex-col">
        <LandingNav onBookDemo={openDemoModal} />
        <main id="landing-content" tabIndex={-1} className="landing-main relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-6 pb-12 sm:gap-12 sm:px-6 sm:py-10 lg:px-8">
          <LandingHero onBookDemo={openDemoModal} />
          <LandingSolutionSection onBookDemo={openDemoModal} />
          <section id="about" className="scroll-mt-24 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_16px_48px_rgba(10,43,109,0.08)] backdrop-blur sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5A00D6]">A clearer way to work</p>
            <h2 className="mt-2 max-w-3xl text-2xl font-black tracking-tight text-[#0A2B6D] sm:text-3xl">Connect the record, the next action and the evidence.</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">ComplianceHR Infinity brings people, service delivery, governance and business operations into one organised workspace. Teams can see what needs attention, who owns it and where the supporting record lives.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ['Clear ownership', 'Assign each action to a person, role and due date.'],
                ['Connected work', 'Link tasks and evidence to the record that started them.'],
                ['Honest status', 'Keep incomplete, overdue, unknown and verified states distinct.'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <h3 className="font-bold text-[#0A2B6D]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </section>
          <PricingSection onContactSales={openDemoModal} />
          <LandingFaqSection />
          <LandingCTA onBookDemo={openDemoModal} />
        </main>
        <LandingFooter onBookDemo={openDemoModal} />
        <DemoBookingModal open={demoModalOpen} onClose={() => setDemoModalOpen(false)} initialTopic={demoTopic} />
      </div>
    </div>
  );
}
