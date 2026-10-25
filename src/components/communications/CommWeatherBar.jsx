import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cloud, CloudRain, Sun, CloudSnow, CloudLightning, CloudFog,
  CalendarDays, Clock, HeartHandshake, PhoneCall, Users, CalendarRange, Sparkles,
} from 'lucide-react';

const FALLBACK = { latitude: -33.87, longitude: 151.21 }; // Sydney

const CODES = {
  0: ['Clear Sky', Sun], 1: ['Mostly Sunny', Sun], 2: ['Partly Cloudy', Cloud], 3: ['Overcast', Cloud],
  45: ['Fog', CloudFog], 48: ['Fog', CloudFog],
  51: ['Light Drizzle', CloudRain], 53: ['Drizzle', CloudRain], 55: ['Heavy Drizzle', CloudRain],
  61: ['Light Rain', CloudRain], 63: ['Rain', CloudRain], 65: ['Heavy Rain', CloudRain],
  71: ['Snow', CloudSnow], 73: ['Snow', CloudSnow], 75: ['Heavy Snow', CloudSnow],
  80: ['Showers', CloudRain], 81: ['Showers', CloudRain], 82: ['Heavy Showers', CloudRain],
  95: ['Thunderstorm', CloudLightning], 96: ['Thunderstorm', CloudLightning], 99: ['Thunderstorm', CloudLightning],
};

const ACTIVE_SERVICES = [
  { label: 'Daily Living & Personal Care', path: '/our-participants', icon: Users, status: 'Active' },
  { label: 'Community & Programs', path: '/programs', icon: Sparkles, status: 'Live' },
  { label: 'Shift Roster & Support', path: '/roster', icon: CalendarRange, status: '24/7' },
  { label: 'Referrals & Allied Health', path: '/referrals', icon: HeartHandshake, status: 'Open' },
  { label: 'Emergency & On-Call', path: '/emergency-response', icon: PhoneCall, status: 'Ready' },
];

const dateFmt = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Sydney',
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat('en-AU', {
  timeZone: 'Australia/Sydney',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

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
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${pos.latitude}&longitude=${pos.longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`,
        );
        const data = await res.json();
        if (active) setWeather(data);
      } catch { /* fallback shown */ }
    })();
    return () => { active = false; };
  }, []);

  const w = weather?.current;
  const [label, Icon] = w ? (CODES[w.weather_code] || ['Partly Cloudy', Cloud]) : ['Sunny · 25°C', Sun];

  return (
    <div
      className="comm-weather-bar relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-2.5 shadow-md"
      style={{ '--comm-bar-bg': 'var(--header-gradient)', color: '#ffffff' }}
    >
      <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. LIVE TIME BOX */}
        <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#0A2B6D] bg-white/15 px-3 py-2 backdrop-blur-xs">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-[#0A2B6D] text-white shadow-sm">
            <Clock className="h-4 w-4 text-[#00C6FF]" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Live Time (AEST)</p>
            <p className="font-mono text-sm sm:text-base font-extrabold leading-tight text-white">{timeFmt.format(now)}</p>
          </div>
        </div>

        {/* 2. LIVE DATE BOX */}
        <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#0A2B6D] bg-white/15 px-3 py-2 backdrop-blur-xs">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-[#0A2B6D] text-white shadow-sm">
            <CalendarDays className="h-4 w-4 text-[#00C6FF]" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Today&apos;s Date</p>
            <p className="text-xs sm:text-sm font-extrabold leading-tight text-white">{dateFmt.format(now)}</p>
          </div>
        </div>

        {/* 3. LIVE WEATHER BOX */}
        <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#0A2B6D] bg-white/15 px-3 py-2 backdrop-blur-xs">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-[#0A2B6D] text-white shadow-sm">
            <Icon className="h-4 w-4 text-[#00C6FF]" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">Live Weather</p>
            <p className="text-xs sm:text-sm font-extrabold leading-tight text-white">
              {w ? `${Math.round(w.temperature_2m)}°C · ${label}` : label}
            </p>
            {weather?.daily && (
              <p className="text-[10px] font-semibold text-white/90">
                Range: {Math.round(weather.daily.temperature_2m_min[0])}°–{Math.round(weather.daily.temperature_2m_max[0])}°C
              </p>
            )}
          </div>
        </div>

        {/* 4. ACTIVE SERVICES BOX */}
        <div className="flex flex-col justify-center rounded-xl border-2 border-[#0A2B6D] bg-white/15 px-3 py-1.5 backdrop-blur-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white">
              Active NDIS &amp; Care Services
            </span>
            <span className="rounded-full bg-[#00C6FF] px-1.5 py-0 text-[9px] font-extrabold text-[#0A2B6D]">
              5 Services Live
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {ACTIVE_SERVICES.map((srv) => {
              const SrvIcon = srv.icon;
              return (
                <Link
                  key={srv.label}
                  to={srv.path}
                  className="inline-flex items-center gap-1 rounded-md border border-[#0A2B6D] bg-white px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#0A2B6D] shadow-2xs hover:bg-[#F5F0FF]"
                >
                  <SrvIcon className="h-2.5 w-2.5 text-[#5A00D6]" />
                  <span>{srv.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}