import React from 'react';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';

export default function MarketingSafeShowcase() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-6 md:px-8">
      <ExecutiveWallScene showAllModulesMinimised={true} />
    </section>
  );
}