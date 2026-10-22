import React from 'react';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';

export default function MarketingSafeShowcase() {
  return (
    <section className="mx-auto max-w-6xl bg-white px-3 py-3 md:px-6">
      <ExecutiveWallScene showAllModulesMinimised={true} />
    </section>
  );
}