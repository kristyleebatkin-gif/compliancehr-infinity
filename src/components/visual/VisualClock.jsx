import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock as ClockIcon } from 'lucide-react';

const ACCENTS = {
  indigo: '#4f46e5',
  teal: '#0d9488',
  pink: '#db2777',
  slate: '#0f172a',
};

export default function VisualClock() {
  const [now, setNow] = useState(new Date());
  const [mode, setMode] = useState(localStorage.getItem('vh_clock_mode') || 'analog');
  const [hour24, setHour24] = useState(localStorage.getItem('vh_clock_24') === '1');
  const [accent, setAccent] = useState(localStorage.getItem('vh_clock_accent') || 'indigo');
  const [size, setSize] = useState(Number(localStorage.getItem('vh_clock_size')) || 240);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const save = (key, value) => localStorage.setItem(key, value);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const hourDeg = ((hours % 12) + minutes / 60) * 30;
  const minuteDeg = (minutes + seconds / 60) * 6;
  const secondDeg = seconds * 6;
  const color = ACCENTS[accent] || ACCENTS.indigo;

  const digitalTime = hour24
    ? now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    : now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateLine = now.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ClockIcon className="h-4 w-4" style={{ color }} />
        <span className="text-sm font-semibold">Clock</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button size="sm" variant={mode === 'analog' ? 'default' : 'outline'} onClick={() => { setMode('analog'); save('vh_clock_mode', 'analog'); }}>Analog</Button>
          <Button size="sm" variant={mode === 'digital' ? 'default' : 'outline'} onClick={() => { setMode('digital'); save('vh_clock_mode', 'digital'); }}>Digital</Button>
          <Button size="sm" variant="outline" onClick={() => { setHour24(!hour24); save('vh_clock_24', hour24 ? '0' : '1'); }}>{hour24 ? '24-hour' : '12-hour'}</Button>
          <Button size="sm" variant="outline" onClick={() => { const next = size >= 360 ? 200 : size + 80; setSize(next); save('vh_clock_size', String(next)); }}>Size</Button>
          {Object.entries(ACCENTS).map(([name, hex]) => (
            <button key={name} onClick={() => { setAccent(name); save('vh_clock_accent', name); }} className={`h-6 w-6 rounded-full border-2 ${accent === name ? 'border-foreground' : 'border-transparent'}`} style={{ background: hex }} title={name} />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center py-4">
        {mode === 'analog' ? (
          <svg width={size} height={size} viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="94" fill="none" stroke={color} strokeWidth="6" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => {
              const angle = h * 30 * Math.PI / 180;
              const x1 = 100 + 78 * Math.sin(angle);
              const y1 = 100 - 78 * Math.cos(angle);
              const x2 = 100 + 88 * Math.sin(angle);
              const y2 = 100 - 88 * Math.cos(angle);
              return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="3" strokeLinecap="round" />;
            })}
            <line x1="100" y1="100" x2={100 + 45 * Math.sin(hourDeg * Math.PI / 180)} y2={100 - 45 * Math.cos(hourDeg * Math.PI / 180)} stroke="#0f172a" strokeWidth="7" strokeLinecap="round" />
            <line x1="100" y1="100" x2={100 + 65 * Math.sin(minuteDeg * Math.PI / 180)} y2={100 - 65 * Math.cos(minuteDeg * Math.PI / 180)} stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <line x1="100" y1="100" x2={100 + 75 * Math.sin(secondDeg * Math.PI / 180)} y2={100 - 75 * Math.cos(secondDeg * Math.PI / 180)} stroke={color} strokeWidth="2" strokeLinecap="round" />
            <circle cx="100" cy="100" r="5" fill={color} />
          </svg>
        ) : (
          <div className="text-center" style={{ color }}>
            <div className="font-display font-bold tabular-nums" style={{ fontSize: size / 3 }}>{digitalTime}</div>
          </div>
        )}
        <p className="mt-4 text-sm font-medium text-muted-foreground">{dateLine}</p>
      </div>
    </div>
  );
}