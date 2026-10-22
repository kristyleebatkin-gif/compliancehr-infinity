import React from 'react';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import PricingSection from '@/components/landing/PricingSection';

export default function MarketingSafeShowcase() {
  return (
    <section className="w-full bg-white p-1 space-y-1.5">
      <ExecutiveWallScene showAllModulesMinimised={true} />
      <PricingSection />
    </section>
  );
}