import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, CloudFog, Newspaper, Tv, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    timeZone: 'Australia/Sydney',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-1.5 shadow-lg"
      style={{
        background: 'linear-gradient(135deg, #cbd5e1 0%, #f8fafc 28%, #94a3b8 50%, #e2e8f0 75%, #64748b 100%)',
        border: '3px solid #94a3b8',
      }}
    >
      {/* Silver Screen Top Bezel Bar */}
      <div className="mb-1 flex items-center justify-between rounded-t-xl bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 px-2.5 py-1 text-white">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider">
          <Tv className="h-3 w-3" /> Silver Screen · Live Dual Display
        </span>
        <span className="font-mono text-[10px] font-extrabold">{timeStr}</span>
      </div>

      {/* Two Halves Inside the Silver Screen */}
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {/* LEFT HALF: LIVE WEATHER UPDATES */}
        <div
          className="flex flex-col justify-between rounded-xl border-2 border-sky-300 p-2 text-white shadow-inner"
          style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 60%, #7c3aed 100%)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/90">
              Half 1 · Live Weather Updates
            </span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-extrabold text-white">
              LIVE
            </span>
          </div>
          <div className="my-1 flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/40">
              <WeatherIcon className="h-6 w-6 text-amber-200" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-extrabold leading-tight text-white">
                {current ? `${Math.round(current.temperature_2m)}°C · ${weatherLabel}` : '27°C · Mostly Sunny'}
              </div>
              <div className="text-[10px] font-bold text-white/90">
                {weather?.daily
                  ? `Min ${Math.round(weather.daily.temperature_2m_min[0])}°C / Max ${Math.round(weather.daily.temperature_2m_max[0])}°C · Wind ${Math.round(current?.wind_speed_10m || 12)} km/h`
                  : 'North Queensland & Sydney Live Weather Feed'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT HALF: LIVE NDIS NEWS & UPDATES */}
        <div
          className="flex flex-col justify-between rounded-xl border-2 border-pink-300 bg-white p-2 text-foreground shadow-inner"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-purple-900">
              <Newspaper className="h-3 w-3 text-pink-600" /> Half 2 · NDIS News &amp; Updates
            </span>
            <Link
              to="/ndis-updates"
              className="inline-flex items-center gap-0.5 rounded bg-pink-100 px-1.5 py-0.5 text-[8px] font-extrabold text-pink-800 hover:bg-pink-200"
            >
              Open <ExternalLink className="h-2.5 w-2.5" />
            </Link>
          </div>
          <ul className="space-y-1">
            {ndisItems.map((item, idx) => (
              <li
                key={item.id || idx}
                className="flex items-center justify-between gap-1.5 rounded-md border border-purple-200 bg-purple-50/60 px-2 py-0.5 text-[10px]"
              >
                <span className="truncate font-extrabold text-blue-950">
                  {item.title || item.headline || 'NDIS Compliance Update'}
                </span>
                <span className="shrink-0 rounded bg-purple-200/80 px-1 py-0 text-[8px] font-extrabold text-purple-900">
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