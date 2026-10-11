import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, Volume2 } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const speak = (text) => {
  if ('speechSynthesis' in window && text) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
};

export default function DayDateBoard() {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-AU', { weekday: 'long' });
  const dayNumber = now.getDate();
  const monthName = MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const sentence = `Today is ${dayName}, ${dayNumber} ${monthName} ${year}.`;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-brand" />Day and date board</div>
      <p className="mb-4 text-xs text-muted-foreground">A big, clear display of today's day and date for daily orientation.</p>

      <div className="mb-4 flex flex-col items-center gap-1 rounded-xl bg-gradient-brand-soft p-6 text-center">
        <div className="text-5xl font-bold font-display">{dayName}</div>
        <div className="text-3xl font-semibold">{dayNumber} {monthName} {year}</div>
        <Button size="sm" variant="outline" className="mt-2" onClick={() => speak(sentence)}><Volume2 className="h-4 w-4" />Say it</Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((d) => (
          <div key={d} className={`rounded-lg border p-2 text-center text-xs font-bold ${d === dayName ? 'border-brand bg-brand/10 text-brand' : 'border-border/60 bg-background text-foreground/60'}`}>
            {d.slice(0, 3)}
          </div>
        ))}
      </div>
    </div>
  );
}