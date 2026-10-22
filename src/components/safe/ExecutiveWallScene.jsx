import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { Clock, Sparkles, Frame, Building2, ShieldCheck, Award, Code2, Phone, Mail, MapPin, BadgeCheck } from 'lucide-react';

export const SQUISHED_GRADIENT = 'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';

function ExecutiveChairFrontLeftSvg() {
  return (
    <svg viewBox="0 0 150 165" className="h-28 w-28 shrink-0 drop-shadow-md" aria-label="Executive Chair with High Chair Back at Front Left">
      <defs>
        <linearGradient id="chairBackSquished" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Tall Contoured Chair Back (Clearly Visible Behind Seat) */}
      <rect x="30" y="6" width="90" height="82" rx="20" fill="url(#chairBackSquished)" stroke="#ffffff" strokeWidth="3.5" />
      {/* Inner Chair Back Frame & Headrest */}
      <rect x="40" y="13" width="70" height="18" rx="8" fill="#ffffff" fillOpacity="0.32" stroke="#ffffff" strokeWidth="1.5" />
      <text x="75" y="25" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">CHAIR BACK</text>
      {/* Ribbed Lumbar Support on Chair Back */}
      <line x1="42" y1="44" x2="108" y2="44" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2.5" />
      <line x1="42" y1="58" x2="108" y2="58" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2.5" />
      <line x1="42" y1="72" x2="108" y2="72" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2.5" />
      {/* Left & Right Curved Armrests */}
      <path d="M30 62 C12 62, 12 96, 28 100" fill="none" stroke="#1d4ed8" strokeWidth="8" strokeLinecap="round" />
      <path d="M120 62 C138 62, 138 96, 122 100" fill="none" stroke="#db2777" strokeWidth="8" strokeLinecap="round" />
      {/* Seat Cushion */}
      <rect x="22" y="84" width="106" height="24" rx="11" fill="url(#chairBackSquished)" stroke="#ffffff" strokeWidth="3" />
      {/* Hydraulic Column */}
      <rect x="70" y="108" width="10" height="28" rx="3" fill="#1e293b" />
      {/* 5-Star Base on Front-Left Floor */}
      <path d="M75 136 L30 150 M75 136 L120 150 M75 136 L50 155 M75 136 L100 155 M75 136 L75 156" stroke="#1e293b" strokeWidth="5.5" strokeLinecap="round" />
      {/* Wheels */}
      <circle cx="28" cy="152" r="5" fill="#2563eb" />
      <circle cx="122" cy="152" r="5" fill="#ec4899" />
      <circle cx="50" cy="157" r="5" fill="#7c3aed" />
      <circle cx="100" cy="157" r="5" fill="#7c3aed" />
      <circle cx="75" cy="159" r="5" fill="#ec4899" />
    </svg>
  );
}

function ThreeDoorCupboard() {
  const doors = [
    { num: 'Door 1', label: 'Company Safe & Registers', color: '#2563eb', badge: 'Locked' },
    { num: 'Door 2', label: 'NDIS & HR Records', color: '#7c3aed', badge: 'Secured' },
    { num: 'Door 3', label: 'Certificates & Policies', color: '#ec4899', badge: 'Verified' },
  ];
  return (
    <div className="w-full rounded-xl border-2 border-violet-600 bg-white p-2.5 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-violet-950">
        <span>3-Door Office Cupboard</span>
        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[9px] text-pink-800">3 Doors Active</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {doors.map((d) => (
          <div
            key={d.num}
            className="relative flex min-h-[76px] flex-col justify-between rounded-lg border-2 p-2 text-white shadow-sm"
            style={{
              borderColor: '#ffffff',
              background: `linear-gradient(160deg, ${d.color} 0%, ${d.color}dd 100%)`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/90">{d.num}</span>
              <span className="rounded bg-white/25 px-1.5 py-0 text-[8px] font-bold text-white">{d.badge}</span>
            </div>
            <div className="my-0.5 text-[10px] font-extrabold leading-tight text-white">{d.label}</div>
            <div className="flex justify-end">
              <span className="h-3.5 w-1.5 rounded-full bg-white shadow" title="Cupboard Door Handle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExecutiveWallScene({ logoUrl, companyName, sloganLine1, sloganLine2, business, developer, softwareName }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = now.toLocaleTimeString('en-AU', {
    timeZone: 'Australia/Sydney',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-AU', {
    timeZone: 'Australia/Sydney',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 p-3.5 sm:p-4 shadow-md"
      style={{
        borderColor: '#2563eb66',
        background:
          'linear-gradient(180deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.06) 50%, rgba(236,72,153,0.14) 100%)',
      }}
    >
      {/* Main Grid: Left = 4 cols (1x), Top-Right of Colour = 8 cols (2x TWICE THE SIZE) */}
      <div className="grid gap-4 lg:grid-cols-12 items-stretch">
        {/* LEFT COLUMN (1x = 4 cols): TOP-LEFT PICTURE FRAME (Logo, Name, Slogan) + FRONT LEFT CHAIR BACK */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3 rounded-2xl border-2 border-blue-400 bg-white/95 p-3 shadow-sm">
          {/* TOP LEFT FRAME: Logo, Name & Slogan */}
          <div className="w-full">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
                <Frame className="h-3 w-3 text-pink-600" /> Top-Left Picture Frame
              </span>
              <span className="text-[9px] font-extrabold text-purple-700">Logo · Name · Slogan</span>
            </div>

            <div
              className="w-full rounded-2xl p-1.5 shadow-lg"
              style={{ background: SQUISHED_GRADIENT }}
            >
              <div className="rounded-xl border-4 border-amber-300 bg-white p-3 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 border-pink-400 bg-white p-1 shadow-sm">
                  <Image
                    src={logoUrl}
                    alt={companyName}
                    fittingType="fit"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-1.5 text-sm font-extrabold tracking-tight text-blue-950">
                  {companyName}
                </div>
                <div className="text-[11px] font-extrabold text-pink-700">
                  {softwareName || 'ComplianceHR INFINITY'} · Choices NQ
                </div>
                <div
                  className="mt-1.5 rounded-lg px-2.5 py-1.5 text-white shadow-sm"
                  style={{ background: SQUISHED_GRADIENT }}
                >
                  <div className="text-[11px] font-extrabold leading-tight">{sloganLine1}</div>
                  <div className="text-[11px] font-extrabold leading-tight">{sloganLine2}</div>
                </div>
              </div>
            </div>
          </div>

          {/* FRONT LEFT: EXECUTIVE CHAIR WITH CHAIR BACK */}
          <div
            className="flex items-center gap-3 rounded-xl border-2 p-2.5 shadow-sm"
            style={{
              borderColor: '#ec489988',
              background: 'linear-gradient(120deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 50%, rgba(236,72,153,0.14) 100%)',
            }}
          >
            <ExecutiveChairFrontLeftSvg />
            <div className="min-w-0 flex-1 text-left">
              <span className="inline-block rounded-full bg-pink-100 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-pink-800">
                Front Left · Chair Back
              </span>
              <div className="mt-1 text-xs font-extrabold text-blue-950">
                Executive Chair with High Chair Back
              </div>
              <div className="mt-0.5 text-[10px] font-bold leading-snug text-foreground/80">
                Positioned Front Left on the floor directly beneath your Top-Left Logo, Name &amp; Slogan Frame.
              </div>
            </div>
          </div>
        </div>

        {/* TOP-RIGHT COLOUR AREA (2x TWICE THE SIZE = 8 cols): Vibrant Multi-Colour Frame with Squished Purple, Role, Name, Icon, Details, Smart Clock & 3-Door Cupboard */}
        <div
          className="lg:col-span-8 rounded-2xl p-2 shadow-xl"
          style={{
            background:
              'linear-gradient(120deg, #2563eb 0%, #0ea5e9 22%, #10b981 38%, #7c3aed 50%, #eab308 64%, #ec4899 100%)',
          }}
        >
          <div
            className="flex h-full flex-col justify-between gap-3 rounded-xl border-4 border-white p-4 text-white shadow-inner"
            style={{
              background: SQUISHED_GRADIENT,
            }}
          >
            {/* Top Banner inside the 2x Colour Area */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/30 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-violet-700 shadow">
                  <Sparkles className="h-4 w-4 text-pink-600" />
                </span>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">
                    Top-Right Vibrant Colour Area (2× Size · Squished Purple)
                  </div>
                  <div className="text-sm sm:text-base font-extrabold text-white">
                    {companyName} (Choices NQ) — {softwareName || 'ComplianceHR INFINITY'}
                  </div>
                </div>
              </div>

              {/* Live Smart Clock Pill in Top-Right Colour Area */}
              <div className="flex items-center gap-2.5 rounded-xl bg-white/20 px-3 py-1.5 ring-1 ring-white/40">
                <Clock className="h-4 w-4 text-white shrink-0" />
                <div className="text-right">
                  <div className="font-mono text-sm font-extrabold leading-none text-white">{timeStr}</div>
                  <div className="text-[10px] font-bold text-white/95">{dateStr}</div>
                </div>
              </div>
            </div>

            {/* Middle 2x Colour Grid: Icon, Role, Name, Slogan & Full Developer + Business Details */}
            <div className="grid gap-3 md:grid-cols-2">
              {/* Left Card in Colour Area: Icon, Role, Name, Slogan */}
              <div className="rounded-xl bg-white/95 p-3 text-foreground shadow-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                    Identity &amp; Role in Colour Frame
                  </span>
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white"
                    style={{ background: SQUISHED_GRADIENT }}
                  >
                    <Building2 className="h-3 w-3" /> <ShieldCheck className="h-3 w-3" /> <Award className="h-3 w-3" /> Icon
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="font-extrabold text-blue-950">Role: </span>
                    <span className="font-extrabold text-pink-700">Registered NDIS Provider &amp; Business Owner</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-blue-950">Name: </span>
                    <span className="font-bold text-blue-950">{companyName} (Choices NQ)</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-blue-950">Software: </span>
                    <span className="font-bold text-violet-800">{softwareName || 'ComplianceHR INFINITY'}</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-blue-950">Slogan: </span>
                    <span className="font-extrabold text-pink-700">{sloganLine1} {sloganLine2}</span>
                  </div>
                </div>
              </div>

              {/* Right Card in Colour Area: Other Details (Business & Developer) */}
              <div className="rounded-xl bg-white/95 p-3 text-foreground shadow-sm space-y-1">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-pink-700">
                  Other Details · Business Use &amp; Developer
                </div>
                <div className="text-[11px] font-bold text-foreground/90 space-y-0.5 leading-snug">
                  <div className="truncate font-extrabold text-blue-950">
                    {business?.trading_name || 'DALTON, KRISTY LEE Trading as CHOICES NORTH QUEENSLAND'}
                  </div>
                  <div className="flex flex-wrap gap-x-3">
                    <span className="inline-flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3 text-blue-600" /> ABN: {business?.abn || '11769681650'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-violet-600" /> NDIS ID: {business?.ndis_provider_number || '4-LPHJR5O'}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-pink-600 shrink-0" />
                    <span>{business?.address_line || 'U5/14 Keane Street, Currajong, QLD, 4812'}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 pt-0.5 border-t border-blue-100">
                    <span className="inline-flex items-center gap-1">
                      <Code2 className="h-3 w-3 text-violet-600" /> Dev: {developer?.name || 'Kristy Lee Whelan'} ({developer?.location || 'North QLD'})
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3 text-blue-600" /> {business?.phone || '0402 165 668'}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3 text-pink-600" /> {business?.email || 'kristyleebatkin@live.com.au'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom of 2x Colour Area: 3-Door Office Cupboard */}
            <ThreeDoorCupboard />
          </div>
        </div>
      </div>
    </div>
  );
}