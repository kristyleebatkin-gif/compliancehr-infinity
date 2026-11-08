import React, { useState } from 'react';
import { ArrowLeft, Volume2, Megaphone, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function HighlightsScreen({ derived, onBack }) {
  const { toast } = useToast();
  const [praiseSent, setPraiseSent] = useState(false);

  const needs = [
    { id: 'esc', label: 'Escalations waiting', value: derived.escalations.length },
    { id: 'inc', label: 'Open incidents', value: derived.noteIncidents.length },
    { id: 'late', label: 'Not clocked in', value: derived.late.length },
    { id: 'unfilled', label: 'Unfilled shifts', value: derived.unfilled.length }
  ].filter((item) => item.value > 0);

  const wins = [
    { id: 'on', label: 'Team on shift right now', value: derived.onShift.length },
    { id: 'notes', label: 'Shift notes completed today', value: derived.missingNotes.length === 0 ? 'All in' : 'In progress' },
    { id: 'clear', label: 'Incidents logged from notes', value: derived.noteIncidents.length }
  ];

  const summary = needs.length
    ? `${needs.length} things need you today: ${needs.map((item) => `${item.value} ${item.label.toLowerCase()}`).join(', ')}.`
    : 'Nothing is escalated right now. The team is on shift and the notes are in.';

  const readAloud = () => {
    if (!('speechSynthesis' in window)) {
      toast({ title: 'Read aloud unavailable', description: 'This browser cannot read text out loud.', variant: 'destructive' });
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(`${summary} Wins today: ${wins.map((w) => `${w.value} ${w.label.toLowerCase()}`).join(', ')}.`);
    utter.lang = 'en-AU';
    window.speechSynthesis.speak(utter);
  };

  const sendPraise = () => {
    setPraiseSent(true);
    toast({ title: 'Praise ready', description: 'Share it with the team in Messages.' });
  };

  return (
    <div className="px-3.5 pt-3.5">
      <header className="mb-2 flex items-center gap-2">
        <button type="button" onClick={onBack} aria-label="Back" className="tl-btn tl-ghost !px-2">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="tl-text min-w-0 flex-1 truncate text-[16px] font-extrabold">Today's highlights</h1>
        <button type="button" onClick={readAloud} aria-label="Read aloud" className="tl-btn tl-ghost !px-2">
          <Volume2 className="h-4 w-4" />
        </button>
      </header>

      <section className="tl-card p-3">
        <p className="tl-text text-[12px] leading-relaxed">{summary}</p>
      </section>

      <section className="tl-card mt-2 p-3">
        <p className="tl-text text-[11.5px] font-extrabold uppercase tracking-[0.1em]">Needs you</p>
        <div className="mt-1.5 divide-y divide-[#0A2B6D]/8">
          {needs.length ? (
            needs.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1.5">
                <p className="tl-text text-[11.5px] font-semibold">{item.label}</p>
                <span className="tl-pill tl-pink">{item.value}</span>
              </div>
            ))
          ) : (
            <p className="tl-muted py-1.5 text-[11px]">Nothing escalated. Good day.</p>
          )}
        </div>
      </section>

      <section className="tl-card mt-2 p-3">
        <p className="tl-text text-[11.5px] font-extrabold uppercase tracking-[0.1em]">Wins today</p>
        <div className="mt-1.5 space-y-1.5">
          {wins.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0AA070]" />
              <p className="tl-text text-[11.5px] font-semibold">{item.label}</p>
              <span className="tl-pill tl-green ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <button type="button" onClick={sendPraise} className="tl-btn tl-primary mt-2 w-full">
        <Megaphone className="h-3.5 w-3.5" /> {praiseSent ? 'Praise sent to the team' : 'Send praise to team'}
      </button>
    </div>
  );
}