import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, CloudFog, Newspaper, Tv, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BUSINESS_TIME_ZONE } from '@/lib/businessTime';

const FALLBACK_COORDS = { latitude: -19.259, longitude: 146.8169 }; // North QLD / Townsville

const WEATHER_CODES = {
  0: ['Clear Sky', Sun],
  1: ['Mostly Sunny', Sun],
  2: ['Partly Cloudy', Cloud],
  3: ['Overcast', Cloud],
  45: ['Foggy', CloudFog],
  48: ['Foggy', CloudFog],
  51: ['Light Drizzle', CloudRain],
  53: ['Drizzle', CloudRain],
  55: ['Heavy Drizzle', CloudRain],
  61: ['Light Rain', CloudRain],
  63: ['Rain', CloudRain],
  65: ['Heavy Rain', CloudRain],
  71: ['Snow', CloudSnow],
  80: ['Showers', CloudRain],
  81: ['Showers', CloudRain],
  82: ['Heavy Showers', CloudRain],
  95: ['Thunderstorm', CloudLightning],
};

const FALLBACK_NDIS_UPDATES = [
  {
    id: 'ndis-1',
    title: 'NDIS Pricing Arrangements & Price Limits — Current Schedule Active',
    category: 'Pricing & Billing',
    published_date: 'Live Update',
  },
  {
    id: 'ndis-2',
    title: 'NDIS Practice Standards & Quality Indicators — Audit Readiness Check',
    category: 'Compliance',
    published_date: 'Live Update',
  },
  {
    id: 'ndis-3',
    title: 'Worker Screening, Reportable Incidents & 24h Notification Rules',
    category: 'Safeguards',
    published_date: 'Live Update',
  },
];

export default function SilverScreenSplit() {
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState(null);
  const [ndisItems, setNdisItems] = useState(FALLBACK_NDIS_UPDATES);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      let pos = FALLBACK_COORDS;
      try {
        pos = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) return reject();
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
            reject,
            { timeout: 3500 }
          );
        });
      } catch {
        pos = FALLBACK_COORDS;
      }
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${pos.latitude}&longitude=${pos.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
        );
        const data = await res.json();
        if (active) setWeather(data);
      } catch {
        // Keep default display
      }
    })();

    (async () => {
      try {
        const page = await base44.entities.NdisUpdate.list({ sort: '-created_date', limit: 3 });
        if (active && page?.items?.length) {
          setNdisItems(page.items.slice(0, 3));
        }
      } catch {
        // Use fallback NDIS updates
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const current = weather?.current;
  const [weatherLabel, WeatherIcon] = current
    ? WEATHER_CODES[current.weather_code] || ['Partly Cloudy', Cloud]
    : ['Sunny · 27°C', Sun];

  const timeStr = now.toLocaleTimeString('en-AU', {
    timeZone: BUSINESS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div
      className="relative overflow-hidden rounded-xl p-1 shadow-md"
      style={{
        background: 'linear-gradient(135deg, #cbd5e1 0%, #f8fafc 28%, #94a3b8 50%, #e2e8f0 75%, #64748b 100%)',
        border: '2px solid #94a3b8',
      }}
    >
      {/* Squashed Silver Screen Top Bezel Bar: Time, Date, Weather & Services */}
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1 rounded-t-lg border border-[#0A2B6D] bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 px-2 py-1 text-white">
        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider">
          <Tv className="h-2.5 w-2.5" /> Time · Date · Weather · Services
        </span>
        <span className="font-mono text-[9px] font-extrabold">
          {now.toLocaleDateString('en-AU', { timeZone: BUSINESS_TIME_ZONE, weekday: 'short', day: 'numeric', month: 'short' })} · {timeStr}
        </span>
      </div>

      {/* Two Halves Inside the Silver Screen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {/* LEFT HALF: LIVE WEATHER UPDATES — PURE WHITE INSIDE TEXT BOX */}
        <div className="flex flex-col justify-between rounded-lg border border-[#0A2B6D] bg-white p-1.5 text-[#0A2B6D]">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              Live Weather
            </span>
            <span className="rounded-full border border-[#0A2B6D]/30 bg-white px-1 py-0 text-[7px] font-extrabold text-[#0A2B6D]">
              LIVE
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#0A2B6D]/25 bg-white">
              <WeatherIcon className="h-3.5 w-3.5 text-[#0A2B6D]" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[11px] font-extrabold leading-tight text-[#0A2B6D]">
                {current ? `${Math.round(current.temperature_2m)}°C · ${weatherLabel}` : '27°C · Sunny'}
              </div>
              <div className="truncate text-[8px] font-bold text-[#0A2B6D]">
                {weather?.daily
                  ? `${Math.round(weather.daily.temperature_2m_min[0])}°–${Math.round(weather.daily.temperature_2m_max[0])}°C · ${Math.round(current?.wind_speed_10m || 12)}km/h`
                  : 'Live Weather Feed'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HALF: LIVE SERVICES & NDIS UPDATES — PURE WHITE INSIDE TEXT BOXES */}
        <div className="flex flex-col justify-between rounded-lg border border-[#0A2B6D] bg-white p-1.5 text-[#0A2B6D]">
          <div className="mb-0.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              <Newspaper className="h-2.5 w-2.5 text-[#0A2B6D]" /> Active Services &amp; NDIS
            </span>
            <Link
              to="/referrals"
              className="inline-flex items-center gap-0.5 rounded border border-[#0A2B6D]/30 bg-white px-1 py-0 text-[7.5px] font-extrabold text-[#0A2B6D]"
            >
              Services <ExternalLink className="h-2 w-2" />
            </Link>
          </div>
          <div className="mb-1 flex flex-wrap gap-0.5">
            {[
              { label: 'Daily Living', to: '/our-participants' },
              { label: 'Community', to: '/programs' },
              { label: 'Roster 24/7', to: '/roster' },
              { label: 'Referrals', to: '/referrals' },
            ].map((srv) => (
              <Link
                key={srv.label}
                to={srv.to}
                className="rounded border border-[#0A2B6D]/30 bg-white px-1 py-0 text-[7px] font-extrabold text-[#0A2B6D]"
              >
                {srv.label}
              </Link>
            ))}
          </div>
          <ul className="space-y-0.5">
            {ndisItems.slice(0, 2).map((item, idx) => (
              <li
                key={item.id || idx}
                className="flex items-center justify-between gap-1 rounded border border-[#0A2B6D]/30 bg-white px-1 py-0 text-[8px]"
              >
                <span className="truncate font-extrabold text-[#0A2B6D]">
                  {item.title || item.headline || 'NDIS Update'}
                </span>
                <span className="shrink-0 rounded border border-[#0A2B6D]/30 bg-white px-1 py-0 text-[7px] font-extrabold text-[#0A2B6D]">
                  {item.category || 'NDIS'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}