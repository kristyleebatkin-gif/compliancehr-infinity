import React, { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';
import { Clock, Sparkles, Frame, Building2, ShieldCheck, Award } from 'lucide-react';

const SQUISHED_GRADIENT = 'linear-gradient(120deg, #2563eb 0%, #2563eb 40%, #7c3aed 50%, #ec4899 60%, #ec4899 100%)';

function ExecutiveChairSvg() {
  return (
    <svg viewBox="0 0 140 160" className="h-32 w-28 drop-shadow-md" aria-label="Executive Chair with High Back in Front Corner">
      <defs>
        <linearGradient id="chairBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="55%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* High Executive Chair Back */}
      <rect x="32" y="10" width="76" height="72" rx="18" fill="url(#chairBackGrad)" stroke="#ffffff" strokeWidth="3" />
      {/* Headrest Cushion */}
      <rect x="44" y="16" width="52" height="16" rx="7" fill="#ffffff" fillOpacity="0.28" />
      {/* Tufted Lumbar Lines on Chair Back */}
      <line x1="44" y1="44" x2="96" y2="44" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="44" y1="60" x2="96" y2="60" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="2" />
      {/* Left & Right Armrests */}
      <path d="M32 62 C18 62, 18 92, 30 96" fill="none" stroke="#1e40af" strokeWidth="7" strokeLinecap="round" />
      <path d="M108 62 C122 62, 122 92, 110 96" fill="none" stroke="#be185d" strokeWidth="7" strokeLinecap="round" />
      {/* Plush Seat Cushion */}
      <rect x="24" y="80" width="92" height="24" rx="11" fill="url(#chairBackGrad)" stroke="#ffffff" strokeWidth="2.5" />
      {/* Center Pedestal Column */}
      <rect x="65" y="104" width="10" height="28" rx="3" fill="#334155" />
      {/* 5-Star Floor Base in Front Corner */}
      <path d="M70 132 L30 146 M70 132 L110 146 M70 132 L48 150 M70 132 L92 150 M70 132 L70 152" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />
      {/* Floor Casters */}
      <circle cx="28" cy="148" r="4.5" fill="#ec4899" />
      <circle cx="112" cy="148" r="4.5" fill="#2563eb" />
      <circle cx="48" cy="152" r="4.5" fill="#7c3aed" />
      <circle cx="92" cy="152" r="4.5" fill="#7c3aed" />
      <circle cx="70" cy="154" r="4.5" fill="#ec4899" />
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
    <div className="w-full rounded-2xl border-4 border-violet-700 bg-white p-3 shadow-md">
      <div className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-violet-950">
        <span>3-Door Office Cupboard</span>
        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] text-pink-800">3 Doors Active</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {doors.map((d) => (
          <div
            key={d.num}
            className="relative flex min-h-[110px] flex-col justify-between rounded-xl border-2 p-2.5 text-white shadow-sm"
            style={{
              borderColor: '#ffffff',
              background: `linear-gradient(160deg, ${d.color} 0%, ${d.color}dd 100%)`,
            }}
          >
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-white/90">{d.num}</div>
            <div className="my-1 text-[11px] font-extrabold leading-snug text-white">{d.label}</div>
            <div className="flex items-center justify-between">
              <span className="rounded bg-white/25 px-1.5 py-0.5 text-[9px] font-bold text-white">{d.badge}</span>
              {/* Cupboard Door Handle */}
              <span className="h-5 w-1.5 rounded-full bg-white shadow" title="Cupboard Door Handle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExecutiveWallScene({ logoUrl, companyName, sloganLine1, sloganLine2, business }) {
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
      className="relative overflow-hidden rounded-2xl border-2 p-4 sm:p-5 shadow-md"
      style={{
        borderColor: '#2563eb66',
        background:
          'linear-gradient(180deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 50%, rgba(236,72,153,0.14) 100%)',
      }}
    >
      {/* Top Bar with Squished Purple between Blue & Pink */}
      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-white shadow-sm"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider">
          <Frame className="h-4 w-4" /> Executive Office Wall, Front Corner Chair, Smart Clock &amp; 3-Door Cupboard
        </span>
        <span className="text-[11px] font-extrabold text-white">
          Blue · Squished Purple · Pink
        </span>
      </div>

      {/* Main 2-Column Layout: TOP LEFT = Picture Frame (Logo, Name, Slogan) + Chair in Front Corner; TOP RIGHT = Multi-Colour Frame with Role, Name, Icon, Other Details, Smart Clock & 3-Door Cupboard */}
      <div className="grid gap-5 lg:grid-cols-12 items-stretch">
        {/* LEFT COLUMN (5 cols): TOP-LEFT PICTURE FRAME (Logo, Name, Slogan) + FRONT CORNER CHAIR WITH CHAIR BACK */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border-2 border-blue-400 bg-white/95 p-4 shadow-sm">
          {/* TOP LEFT PICTURE FRAME ON THE WALL */}
          <div className="flex flex-col items-center text-center">
            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
              <Frame className="h-3 w-3 text-pink-600" /> Top-Left Wall Picture Frame · Logo, Name &amp; Slogan
            </span>

            {/* Ornate Multi-Layered Picture Frame */}
            <div
              className="w-full rounded-2xl p-1.5 shadow-xl"
              style={{ background: SQUISHED_GRADIENT }}
            >
              <div className="rounded-xl border-4 border-amber-300 bg-white p-4 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-pink-400 bg-white p-1.5 shadow-md">
                  <Image
                    src={logoUrl}
                    alt={companyName}
                    fittingType="fit"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-2.5 text-base font-extrabold tracking-tight text-blue-950">
                  {companyName}
                </div>
                <div className="text-xs font-extrabold text-pink-700">Choices NQ</div>
                <div
                  className="mt-2 rounded-xl px-3 py-2 text-white shadow-sm"
                  style={{ background: SQUISHED_GRADIENT }}
                >
                  <div className="text-xs font-extrabold leading-snug">{sloganLine1}</div>
                  <div className="text-xs font-extrabold leading-snug">{sloganLine2}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Wall-to-Floor Alignment Line */}
          <div className="mx-auto h-3 w-1 rounded-full bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600" />

          {/* FRONT CORNER FLOOR: EXECUTIVE CHAIR WITH HIGH CHAIR BACK */}
          <div
            className="flex flex-col items-center rounded-2xl border-2 p-3.5 text-center shadow-sm"
            style={{
              borderColor: '#ec489988',
              background: 'linear-gradient(145deg, rgba(37,99,235,0.10) 0%, rgba(236,72,153,0.14) 100%)',
            }}
          >
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-pink-800">
              Front Corner · Executive Chair (With High Chair Back)
            </div>
            <ExecutiveChairSvg />
            <div className="text-xs font-extrabold text-blue-950">
              Seated on the Floor in the Front Corner (Between You &amp; I)
            </div>
            <div className="text-[11px] font-bold text-foreground/80">
              Directly in line below the Top-Left Picture Frame
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): TOP-RIGHT MULTI-COLOUR FRAME + SMART CLOCK + BUSINESS PROFILE (Role, Name, Icon, Other Details) + 3-DOOR CUPBOARD */}
        <div
          className="lg:col-span-7 rounded-2xl p-1.5 shadow-xl"
          style={{
            background:
              'linear-gradient(135deg, #2563eb 0%, #0ea5e9 22%, #10b981 42%, #eab308 62%, #7c3aed 78%, #ec4899 100%)',
          }}
        >
          <div className="flex h-full flex-col justify-between gap-4 rounded-xl border-4 border-white bg-white/95 p-4">
            {/* Top-Right Colour Frame Header + Smart Clock */}
            <div className="grid gap-3 sm:grid-cols-2 items-center">
              {/* Structured Business Profile: Role, Name, Icon, Other Details */}
              <div
                className="rounded-xl border-2 p-3.5 space-y-2"
                style={{
                  borderColor: '#2563eb66',
                  background: 'linear-gradient(145deg, rgba(37,99,235,0.10), rgba(236,72,153,0.10), #ffffff)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800">
                    Top-Right Multi-Colour Frame
                  </span>
                  <Sparkles className="h-4 w-4 text-pink-600" />
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-blue-950 w-24 shrink-0">Icon:</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-white font-extrabold text-[11px]" style={{ background: SQUISHED_GRADIENT }}>
                      <Building2 className="h-3.5 w-3.5" /> <ShieldCheck className="h-3.5 w-3.5" /> <Award className="h-3.5 w-3.5" /> Official Safe Crest
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold text-blue-950 w-24 shrink-0">Role:</span>
                    <span className="font-extrabold text-pink-800">
                      Registered NDIS Provider &amp; Executive Business Owner
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold text-blue-950 w-24 shrink-0">Name:</span>
                    <span className="font-extrabold text-blue-950">
                      {companyName} (Choices NQ) · Kristy Lee Whelan
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-extrabold text-blue-950 w-24 shrink-0">Slogan:</span>
                    <span className="font-extrabold text-purple-900">
                      {sloganLine1} {sloganLine2}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 pt-0.5 border-t border-blue-200">
                    <span className="font-extrabold text-blue-950 w-24 shrink-0">Other Details:</span>
                    <span className="font-bold text-foreground/85 leading-snug">
                      {business?.trading_name || 'DALTON, KRISTY LEE Trading as CHOICES NORTH QUEENSLAND'} · ABN: {business?.abn || '11769681650'} · NDIS Reg ID: {business?.ndis_provider_number || '4-LPHJR5O'} · {business?.address_line || 'U5/14 Keane Street, Currajong, QLD, 4812'} · Ph: {business?.phone || '0402 165 668'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Smart Clock Between You & The Wall */}
              <div
                className="flex flex-col items-center justify-center rounded-xl border-2 p-4 text-center text-white shadow-md"
                style={{
                  borderColor: '#ffffff',
                  background: SQUISHED_GRADIENT,
                }}
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  <Clock className="h-3 w-3" /> Smart Clock · Between You &amp; Wall
                </span>
                <div className="mt-2 font-mono text-2xl font-extrabold tracking-tight text-white">
                  {timeStr}
                </div>
                <div className="mt-0.5 text-xs font-extrabold uppercase tracking-wider text-white/95">
                  {dateStr}
                </div>
                <div className="mt-2 rounded-lg bg-white/20 px-2.5 py-1 text-[10px] font-extrabold text-white">
                  {sloganLine1} · {sloganLine2}
                </div>
              </div>
            </div>

            {/* 3-Door Cupboard on the Wall/Floor */}
            <ThreeDoorCupboard />
          </div>
        </div>
      </div>
    </div>
  );
}