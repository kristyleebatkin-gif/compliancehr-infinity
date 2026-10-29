import React from 'react';
import { BookOpen, PhoneCall } from 'lucide-react';

export default function DummiesHero({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'chapters', label: '1. Plain-English Chapters' },
    { id: 'jargon', label: '2. Jargon Buster (A–Z)' },
    { id: 'eligibility', label: '3. Am I Eligible? Quiz' },
    { id: 'checklist', label: '4. Starter Checklist' },
  ];

  return (
    <header className="border-b-4 border-foreground bg-primary text-primary-foreground">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-md border-2 border-foreground bg-card px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-foreground">
            <BookOpen className="h-4 w-4" />
            The Zero-Jargon Australian Handbook
          </div>
          <a
            href="tel:1800800110"
            className="inline-flex items-center gap-2 rounded-md border-2 border-foreground bg-card px-3 py-1.5 text-xs font-extrabold text-foreground hover:opacity-90"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            NDIS National Line: 1800 800 110
          </a>
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
          NDIS for Dummies
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold opacity-95 sm:text-base">
          Everything you actually need to know about the National Disability Insurance Scheme — explained in plain English, without the confusing government buzzwords.
        </p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`rounded-lg border-2 border-foreground px-4 py-2 text-xs font-extrabold transition sm:text-sm ${
                  active
                    ? 'bg-foreground text-card shadow-sm'
                    : 'bg-card text-foreground hover:bg-secondary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}