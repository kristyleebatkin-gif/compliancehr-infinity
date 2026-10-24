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
  const [label, Icon] = w ? (CODES[w.weather_code] || ['Cloudy', Cloud]) : ['Loading…', Cloud];

  return (
    <div
      className="comm-weather-bar relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl px-4 py-3 shadow-lg"
      style={{ '--comm-bar-bg': 'var(--header-gradient)', color: '#ffffff' }}
    >
      <div className="relative flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-md ring-1 ring-white/30">
          <CalendarDays className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Today</p>
          <p className="text-sm font-bold text-white">{dateFmt.format(now)}</p>
        </div>
        <div className="ml-1 border-l border-white/25 pl-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Time</p>
          <p className="font-mono text-lg font-bold leading-5 text-white">{timeFmt.format(now)}</p>
        </div>
      </div>
      <div className="relative flex items-center gap-2.5 rounded-xl bg-white/15 px-3 py-2">
        {w ? (
          <>
            <Icon className="h-6 w-6 text-white" />
            <div>
              <p className="text-lg font-bold leading-5 text-white">{Math.round(w.temperature_2m)}°C</p>
              <p className="text-[11px] font-semibold text-white/85">
                {label}
                {weather?.daily && ` · ${Math.round(weather.daily.temperature_2m_min[0])}–${Math.round(weather.daily.temperature_2m_max[0])}°C`}
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs font-semibold text-white/85">Loading weather…</p>
        )}
      </div>
    </div>
  );
}