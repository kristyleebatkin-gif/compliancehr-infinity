import React from 'react';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';

export default function MarketingSafeShowcase() {
  return (
    <section className="w-full bg-white p-1">
      <ExecutiveWallScene showAllModulesMinimised={true} />
    </section>
  );
}