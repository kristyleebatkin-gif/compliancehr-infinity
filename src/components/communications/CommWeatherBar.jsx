import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cloud, CloudRain, Sun, CloudSnow, CloudLightning, CloudFog,
  CalendarDays, Clock, HeartHandshake, PhoneCall, Users, CalendarRange, Sparkles, ShieldCheck,
} from 'lucide-react';
import { BUSINESS_TIME_ZONE } from '@/lib/businessTime';

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
  { label: 'Daily Care', path: '/our-participants', icon: Users },
  { label: 'Programs', path: '/programs', icon: Sparkles },
  { label: 'Roster 24/7', path: '/roster', icon: CalendarRange },
  { label: 'Referrals', path: '/referrals', icon: HeartHandshake },
  { label: 'On-Call', path: '/emergency-response', icon: PhoneCall },
];

const dateFmt = new Intl.DateTimeFormat('en-AU', {
  timeZone: BUSINESS_TIME_ZONE,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFmt = new Intl.DateTimeFormat('en-AU', {
  timeZone: BUSINESS_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #A855F7 62%, #FF2E9A 100%)';

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
    <section
      aria-label="Live Date, Time, Weather & Active Services Dashboards"
      className="overflow-hidden rounded-xl p-[1.5px] shadow-lg"
      style={{ background: BRAND_GRADIENT }}
    >
      <div className="grid grid-cols-1 gap-1.5 rounded-[10px] bg-[#0A2B6D]/95 backdrop-blur-sm p-2 sm:grid-cols-2 xl:grid-cols-4">
        {/* DASHBOARD 1: LIVE ATOMIC TIME */}
        <div
          className="rounded-lg p-[1.5px]"
          style={{ background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)' }}
        >
          <div className="flex h-full items-center justify-between gap-1.5 rounded-[7px] bg-gradient-to-br from-[#0A2B6D] to-[#16468A] px-2 py-2 text-white shadow-inner ring-1 ring-inset ring-[#00C6FF]/30">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A2B6D]/95 backdrop-blur-sm"
                style={{ border: '1.5px solid #00C6FF', boxShadow: '0 0 10px rgba(0,198,255,0.45)' }}
              >
                <Clock className="h-4 w-4 text-[#00C6FF]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF] animate-pulse" />
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                    Live Time (Sydney)
                  </p>
                </div>
                <p className="font-mono text-sm sm:text-base font-black leading-tight text-white">
                  {timeFmt.format(now)}
                </p>
                <p className="text-[11px] font-bold text-slate-300">24/7 Operations Clock Active</p>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD 2: TODAY'S CALENDAR DATE */}
        <div
          className="rounded-lg p-[1.5px]"
          style={{ background: 'linear-gradient(135deg, #0072FF 0%, #A855F7 100%)' }}
        >
          <div className="flex h-full items-center justify-between gap-1.5 rounded-[7px] bg-gradient-to-br from-[#0A2B6D] to-[#16468A] px-2 py-2 text-white shadow-inner ring-1 ring-inset ring-[#00C6FF]/30">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A2B6D]/95 backdrop-blur-sm"
                style={{ border: '1.5px solid #A855F7', boxShadow: '0 0 10px rgba(168,85,247,0.45)' }}
              >
                <CalendarDays className="h-4 w-4 text-[#A855F7]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A855F7]" />
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#C084FC]">
                    Today&apos;s Date
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-black leading-tight text-white">
                  {dateFmt.format(now)}
                </p>
                <p className="text-[11px] font-bold text-slate-300">Audit &amp; Shift Cycle Day</p>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD 3: LIVE WEATHER & FIELD CONDITIONS */}
        <div
          className="rounded-lg p-[1.5px]"
          style={{ background: 'linear-gradient(135deg, #A855F7 0%, #FF2E9A 100%)' }}
        >
          <div className="flex h-full items-center justify-between gap-1.5 rounded-[7px] bg-gradient-to-br from-[#0A2B6D] to-[#16468A] px-2 py-2 text-white shadow-inner ring-1 ring-inset ring-[#00C6FF]/30">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A2B6D]/95 backdrop-blur-sm"
                style={{ border: '1.5px solid #FF2E9A', boxShadow: '0 0 10px rgba(255,46,154,0.45)' }}
              >
                <Icon className="h-4 w-4 text-[#FF2E9A]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF2E9A]" />
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#FF6EDB]">
                    Live Weather Radar
                  </p>
                </div>
                <p className="text-xs sm:text-sm font-black leading-tight text-white">
                  {w ? `${Math.round(w.temperature_2m)}°C · ${label}` : label}
                </p>
                <p className="text-[11px] font-bold text-slate-300">
                  {weather?.daily
                    ? `High ${Math.round(weather.daily.temperature_2m_max[0])}°C · Low ${Math.round(weather.daily.temperature_2m_min[0])}°C`
                    : 'Field Conditions Optimal'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* DASHBOARD 4: ACTIVE NDIS & CARE SERVICES */}
        <div
          className="rounded-lg p-[1.5px]"
          style={{ background: 'linear-gradient(135deg, #00C6FF 0%, #FF2E9A 100%)' }}
        >
          <div className="flex h-full flex-col justify-between gap-1 rounded-[7px] bg-gradient-to-br from-[#0A2B6D] to-[#16468A] px-2 py-1.5 text-white shadow-inner ring-1 ring-inset ring-[#00C6FF]/30">
            <div className="flex items-center justify-between gap-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                <ShieldCheck className="h-3 w-3 text-[#00C6FF]" />
                <span>Active Care Services</span>
              </span>
              <span className="rounded-full bg-[#0072FF] px-1.5 py-0 text-[8px] font-extrabold text-white">
                5 Live
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {ACTIVE_SERVICES.map((srv) => {
                const SrvIcon = srv.icon;
                return (
                  <Link
                    key={srv.label}
                    to={srv.path}
                    className="inline-flex items-center gap-1 rounded border border-[#00C6FF]/50 bg-[#0A2B6D]/95 backdrop-blur-sm px-1.5 py-0.5 text-[10px] font-extrabold text-white transition hover:border-[#FF2E9A] hover:bg-[#0072FF]"
                  >
                    <SrvIcon className="h-2.5 w-2.5 text-[#00C6FF]" />
                    <span>{srv.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}