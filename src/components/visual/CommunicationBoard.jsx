import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COMM_CATEGORIES, COMM_TILES } from '@/lib/communicationBoard';
import { MessageSquareText, Trash2, Undo2, Volume2 } from 'lucide-react';

const speak = (text) => {
  if ('speechSynthesis' in window && text) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
};

export default function CommunicationBoard() {
  const [strip, setStrip] = useState([]);
  const [category, setCategory] = useState('Quick Phrases');
  const tiles = COMM_TILES[category] || [];

  const add = (label) => {
    setStrip((s) => [...s, label]);
    speak(label);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <MessageSquareText className="h-4 w-4 text-brand" />
        <span className="text-sm font-semibold">Communication board</span>
        <div className="ml-auto flex items-center gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COMM_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-3 flex min-h-[64px] flex-wrap items-center gap-2 rounded-xl border-2 border-brand/30 bg-brand/5 p-3">
        {strip.length === 0 && <span className="text-sm text-muted-foreground">Tap tiles below to build a sentence. Tap Speak to say it.</span>}
        {strip.map((word, i) => (
          <button key={`${word}-${i}`} onClick={() => setStrip((s) => s.filter((_, j) => j !== i))} className="rounded-lg bg-card px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-border">
            {word}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => speak(strip.join(' '))} disabled={!strip.length}><Volume2 className="h-4 w-4" />Speak sentence</Button>
        <Button size="sm" variant="outline" onClick={() => setStrip((s) => s.slice(0, -1))} disabled={!strip.length}><Undo2 className="h-4 w-4" />Undo</Button>
        <Button size="sm" variant="ghost" onClick={() => setStrip([])} disabled={!strip.length}><Trash2 className="h-4 w-4 text-destructive" />Clear</Button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
        {tiles.map((t) => (
          <button key={t.label} onClick={() => add(t.label)} className="flex flex-col items-center gap-1 rounded-xl border border-border/60 bg-background p-3 text-center hover:border-brand/50 hover:bg-brand/5">
            <span className="text-3xl">{t.emoji}</span>
            <span className="text-xs font-bold leading-tight">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}