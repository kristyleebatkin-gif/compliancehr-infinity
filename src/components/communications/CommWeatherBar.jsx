import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, CloudFog, CalendarDays } from 'lucide-react';

const FALLBACK = { latitude: -33.87, longitude: 151.21 }; // Sydney

const CODES = {
  0: ['Clear', Sun], 1: ['Mostly sunny', Sun], 2: ['Partly cloudy', Cloud], 3: ['Overcast', Cloud],
  45: ['Fog', CloudFog], 48: ['Fog', CloudFog],
  51: ['Light drizzle', CloudRain], 53: ['Drizzle', CloudRain], 55: ['Heavy drizzle', CloudRain],
  61: ['Light rain', CloudRain], 63: ['Rain', CloudRain], 65: ['Heavy rain', CloudRain],
  71: ['Snow', CloudSnow], 73: ['Snow', CloudSnow], 75: ['Heavy snow', CloudSnow],
  80: ['Showers', CloudRain], 81: ['Showers', CloudRain], 82: ['Heavy showers', CloudRain],
  95: ['Thunderstorm', CloudLightning], 96: ['Thunderstorm', CloudLightning], 99: ['Thunderstorm', CloudLightning],
};

const dateFmt = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

export default function CommWeatherBar() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      let pos = FALLBACK;
      try {
        pos = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject();
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
            reject,
            { timeout: 4000 },
          );
        });
      } catch { pos = FALLBACK; }
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.latitude}&longitude=${pos.longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`);
        const data = await res.json();
        if (active) setWeather(data);
      } catch { /* weather stays hidden on failure */ }
    })();
    return () => { active = false; };
  }, []);

  const w = weather?.current;
  const [label, Icon] = w ? (CODES[w.weather_code] || ['Cloudy', Cloud]) : null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-3 transition-all hover:-translate-y-1 hover:shadow-lg"
      style={{ borderColor: '#0891b255', boxShadow: '0 6px 16px -12px #0891b2aa' }}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#0891b21f', color: '#0891b2' }}>
          <CalendarDays className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">Today</p>
          <p className="text-sm font-bold" style={{ color: '#0891b2' }}>{dateFmt.format(now)}</p>
        </div>
        <div className="ml-1 border-l border-border pl-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">Time</p>
          <p className="font-mono text-lg font-bold leading-5" style={{ color: '#0891b2' }}>{timeFmt.format(now)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 rounded-full px-3 py-2" style={{ background: '#0ea5e91f' }}>
        {w ? (
          <>
            <Icon className="h-6 w-6" style={{ color: '#0ea5e9' }} />
            <div>
              <p className="text-lg font-bold leading-5" style={{ color: '#0ea5e9' }}>{Math.round(w.temperature_2m)}°C</p>
              <p className="text-[11px] font-semibold text-foreground/60">
                {label}
                {weather?.daily && ` · ${Math.round(weather.daily.temperature_2m_min[0])}–${Math.round(weather.daily.temperature_2m_max[0])}°C`}
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs font-semibold text-foreground/60">Loading weather…</p>
        )}
      </div>
    </div>
  );
}