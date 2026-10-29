import React, { useState } from 'react';
import DummiesHero from '@/components/dummies/DummiesHero';
import ChapterGuide from '@/components/dummies/ChapterGuide';
import JargonBuster from '@/components/dummies/JargonBuster';
import EligibilityQuiz from '@/components/dummies/EligibilityQuiz';
import StarterChecklist from '@/components/dummies/StarterChecklist';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chapters');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DummiesHero activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {activeTab === 'chapters' && <ChapterGuide />}
        {activeTab === 'jargon' && <JargonBuster />}
        {activeTab === 'eligibility' && <EligibilityQuiz />}
        {activeTab === 'checklist' && <StarterChecklist />}
      </main>

      <footer className="border-t-2 border-border bg-card py-5 text-center text-xs font-semibold text-muted-foreground">
        NDIS for Dummies — Plain-English Guide to the National Disability Insurance Scheme · Free Help Line: 1800 800 110
      </footer>
    </div>
  );
}