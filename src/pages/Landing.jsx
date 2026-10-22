import React, { useEffect } from 'react';
import MarketingSafeShowcase from '@/components/landing/MarketingSafeShowcase';

export default function Landing() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="min-h-screen bg-white font-elegant antialiased">
      <main className="bg-white">
        <MarketingSafeShowcase />
      </main>
    </div>
  );
}