import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CloudSun, Volume2 } from 'lucide-react';

const OPTIONS = [
  { label: 'Sunny', emoji: '☀️' },
  { label: 'Partly cloudy', emoji: '⛅' },
  { label: 'Cloudy', emoji: '☁️' },
  { label: 'Rainy', emoji: '🌧️' },
  { label: 'Showers', emoji: '🌦️' },
  { label: 'Stormy', emoji: '⛈️' },
  { label: 'Windy', emoji: '💨' },
  { label: 'Foggy', emoji: '🌫️' },
  { label: 'Hot', emoji: '🥵' },
  { label: 'Cold', emoji: '🥶' },
  { label: 'Snowy', emoji: '❄️' },
  { label: 'Rainbow', emoji: '🌈' },
];

const speak = (text) => {
  if ('speechSynthesis' in window && text) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }
};

export default function WeatherBoard() {
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const storageKey = `weather-board-${new Date().toISOString().slice(0, 10)}`;
  const [selected, setSelected] = useState('');
  const [temp, setTemp] = useState('');

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setSelected(saved.weather || '');
      setTemp(saved.temp || '');
    } catch { /* first visit */ }
  }, [storageKey]);

  const persist = (weather, temperature) => {
    setSelected(weather);
    setTemp(temperature);
    try { localStorage.setItem(storageKey, JSON.stringify({ weather, temp: temperature })); } catch { /* ignore */ }
  };

  const chosen = OPTIONS.find((o) => o.label === selected);
  const sentence = chosen ? `The weather today is ${chosen.label}${temp ? ` and ${temp} degrees` : ''}.` : '';

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold"><CloudSun className="h-4 w-4 text-brand" />Weather board</div>
      <p className="mb-4 text-xs text-muted-foreground">Pick today's weather so it can be talked about all day. The choice is saved for today and resets tomorrow.</p>

      <div className="mb-4 flex flex-col items-center gap-1 rounded-xl bg-gradient-brand-soft p-6 text-center">
        <span className="text-7xl">{chosen?.emoji || '🌤️'}</span>
        <div className="text-2xl font-bold font-display">{selected || "Today's weather"}</div>
        <div className="text-xs font-medium text-muted-foreground">{today}</div>
        {chosen && (
          <Button size="sm" variant="outline" className="mt-2" onClick={() => speak(sentence)}><Volume2 className="h-4 w-4" />Say it</Button>
        )}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {OPTIONS.map((o) => (
          <button key={o.label} onClick={() => persist(o.label, temp)} className={`flex flex-col items-center gap-1 rounded-xl border p-3 hover:border-brand/50 hover:bg-brand/5 ${selected === o.label ? 'border-brand bg-brand/10' : 'border-border/60 bg-background'}`}>
            <span className="text-3xl">{o.emoji}</span>
            <span className="text-xs font-bold">{o.label}</span>
          </button>
        ))}
      </div>

      <div className="flex max-w-xs items-center gap-2">
        <Input type="number" inputMode="decimal" placeholder="Temperature (°C)" value={temp} onChange={(e) => persist(selected, e.target.value)} />
        <span className="text-sm font-semibold text-muted-foreground">°C</span>
      </div>
    </div>
  );
}